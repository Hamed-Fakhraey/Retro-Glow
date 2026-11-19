import { alertPresets, renderAlertCycle } from './alertPresets'
import type { AlertPresetId } from './alertPresets'

const priority = ['alarm', 'timer', 'preview'] as const
export type AlertChannel = (typeof priority)[number]
export type AudioStatus = 'locked' | 'ready' | 'unavailable'
export type AlertOptions = {
  preset: AlertPresetId
  durationMs?: number
  onEnd?: () => void
}

type Request = AlertOptions & { deadline?: number; timeout?: ReturnType<typeof setTimeout> }
type Voice = { channel: AlertChannel; source: AudioBufferSourceNode; gain: GainNode }

// Web playback runs only while the app is open. Scheduling and notifications live
// outside this engine so a desktop host can supply its own background scheduler.
export function createAlertAudio(reportStatus: (status: AudioStatus) => void) {
  let context: AudioContext | undefined
  let voice: Voice | undefined
  let disposed = false
  let volume = .65
  const requests = new Map<AlertChannel, Request>()
  const buffers = new Map<AlertPresetId, AudioBuffer>()

  function releaseVoice(stop: boolean) {
    if (!voice) return
    const { source, gain } = voice
    voice = undefined
    source.onended = null
    if (stop) source.stop()
    source.disconnect()
    gain.disconnect()
  }

  function remove(channel: AlertChannel, notify: boolean) {
    const request = requests.get(channel)
    if (!request) return
    requests.delete(channel)
    clearTimeout(request.timeout)
    if (voice?.channel === channel) releaseVoice(true)
    if (notify) request.onEnd?.()
  }

  function reconcile() {
    for (const [channel, request] of requests) {
      if (request.deadline !== undefined && request.deadline <= performance.now()) remove(channel, true)
    }
    const channel = priority.find((candidate) => requests.has(candidate))
    if (voice?.channel === channel) return
    releaseVoice(true)
    if (!context || context.state !== 'running' || !channel) return

    const request = requests.get(channel)
    if (!request) return
    let source: AudioBufferSourceNode | undefined
    let gain: GainNode | undefined
    try {
      let buffer = buffers.get(request.preset)
      if (!buffer) {
        buffer = renderAlertCycle(context, alertPresets[request.preset])
        buffers.set(request.preset, buffer)
      }

      source = context.createBufferSource()
      gain = context.createGain()
      source.buffer = buffer
      source.loop = true
      gain.gain.value = volume
      source.connect(gain).connect(context.destination)
      source.start()
      voice = { channel, source, gain }

      if (request.deadline !== undefined) {
        const playingSource = source
        source.onended = () => {
          if (voice?.source !== playingSource) return
          releaseVoice(false)
          remove(channel, true)
          reconcile()
        }
        // The audio clock enforces the cutoff even when browser timers are delayed.
        source.stop(context.currentTime + Math.max(0, request.deadline - performance.now()) / 1000)
      }
    } catch {
      if (voice) releaseVoice(true)
      else {
        source?.disconnect()
        gain?.disconnect()
      }
      reportStatus('unavailable')
    }
  }

  function contextChanged() {
    if (disposed || !context) return
    reportStatus(context.state === 'running' ? 'ready' : 'locked')
    reconcile()
  }

  function unlock() {
    if (disposed) return
    try {
      if (!context) {
        context = new AudioContext()
        context.addEventListener('statechange', contextChanged)
      }
      if (context.state === 'running') contextChanged()
      else void context.resume().then(contextChanged, () => {
        if (!disposed && context?.state !== 'running') reportStatus('locked')
      })
    } catch {
      reportStatus('unavailable')
    }
  }

  function play(channel: AlertChannel, options: AlertOptions) {
    if (disposed) return false
    if (channel === 'preview' && (requests.has('alarm') || requests.has('timer'))) return false
    if (channel !== 'preview') remove('preview', true)
    remove(channel, true)

    const { durationMs } = options
    const request: Request = { ...options }
    if (durationMs !== undefined) {
      request.deadline = performance.now() + durationMs
      request.timeout = setTimeout(() => {
        if (requests.get(channel) !== request) return
        remove(channel, true)
        reconcile()
      }, durationMs)
    }
    requests.set(channel, request)
    reconcile()
    return true
  }

  function stop(channel: AlertChannel) {
    remove(channel, true)
    reconcile()
  }

  function setVolume(percent: number) {
    volume = percent / 100
    if (voice) voice.gain.gain.value = volume
  }

  function dispose() {
    disposed = true
    for (const channel of priority) remove(channel, false)
    buffers.clear()
    if (context) {
      context.removeEventListener('statechange', contextChanged)
      if (context.state !== 'closed') void context.close().catch(() => undefined)
      context = undefined
    }
  }

  return { play, stop, setVolume, unlock, dispose }
}
