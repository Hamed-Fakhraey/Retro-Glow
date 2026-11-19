type Partial = readonly [frequencyRatio: number, strength: number]
type Note = readonly [onset: number, duration: number, frequency: number, strength?: number]

type AlertPreset = {
  label: string
  cycleSeconds: number
  notes: readonly Note[]
  partials: readonly Partial[]
  envelope: { attack: number; release: number; decay?: number }
  peak: number
}

export const alertPresets = {
  vintage: {
    label: 'ساعت زنگ‌دار قدیمی',
    cycleSeconds: 3,
    notes: [
      [0, .25, 710], [.11, .24, 752, .8], [.22, .25, 710], [.33, .24, 752, .8], [.44, .30, 710],
      [1.2, .25, 710], [1.31, .24, 752, .8], [1.42, .25, 710], [1.53, .24, 752, .8], [1.64, .33, 710],
    ],
    partials: [[1, .36], [1.47, .33], [2.19, .6], [3.17, .23], [4.65, .14]],
    envelope: { attack: .003, release: .08, decay: .073 },
    peak: .29,
  },
  mechanical: {
    label: 'زنگ مکانیکی دوگانه',
    cycleSeconds: 3.1,
    notes: [
      [0, .68, 520], [.27, .52, 783, .9],
      [1.1, .68, 520], [1.37, .52, 783, .9],
    ],
    partials: [[1, .8], [1.8, .26], [2.62, .48], [4.15, .24]],
    envelope: { attack: .006, release: .17, decay: .16 },
    peak: .31,
  },
  retro: {
    label: 'بوق دیجیتال رترو',
    cycleSeconds: 3,
    notes: [
      [0, .16, 784], [.21, .16, 1175], [.42, .16, 784], [.63, .24, 1175],
      [1.13, .18, 659], [1.37, .18, 988], [1.61, .36, 1319],
    ],
    partials: [[1, 1], [3, .3], [5, .12]],
    envelope: { attack: .012, release: .035 },
    peak: .27,
  },
  soft: {
    label: 'زنگ آرام و ملایم',
    cycleSeconds: 3.4,
    notes: [
      [0, 1.13, 392, .7], [.28, 1.05, 494, .66], [.56, 1.3, 587, .76], [1.22, 1.42, 784, .48],
    ],
    partials: [[1, 1], [2, .13], [3, .04]],
    envelope: { attack: .085, release: .65, decay: .75 },
    peak: .22,
  },
  rapid: {
    label: 'هشدار سریع و پرانرژی',
    cycleSeconds: 2.35,
    notes: [
      [0, .085, 740], [.113, .085, 880], [.226, .085, 1047], [.339, .19, 1319],
      [.66, .085, 740], [.773, .085, 880], [.886, .085, 1047], [.999, .19, 1319],
      [1.36, .09, 1319], [1.48, .09, 988], [1.60, .24, 784],
    ],
    partials: [[1, .9], [2, .25], [3, .2], [5, .1]],
    envelope: { attack: .006, release: .026, decay: .24 },
    peak: .32,
  },
} satisfies Record<string, AlertPreset>

export type AlertPresetId = keyof typeof alertPresets
export const alertPresetIds = Object.keys(alertPresets) as AlertPresetId[]

export function renderAlertCycle(context: AudioContext, preset: AlertPreset) {
  const { cycleSeconds, notes, partials, envelope, peak } = preset
  const rate = context.sampleRate
  const buffer = context.createBuffer(1, Math.round(cycleSeconds * rate), rate)
  const data = buffer.getChannelData(0)

  for (const [onset, duration, pitch, strength = 1] of notes) {
    const start = Math.round(onset * rate)
    const samples = Math.min(Math.round(duration * rate), data.length - start)
    const usablePartials = partials.filter(([ratio]) => ratio * pitch < rate / 2)
    for (let index = 0; index < samples; index++) {
      const time = index / rate
      const phase = 2 * Math.PI * pitch * time
      const fade = Math.min(time / envelope.attack, (samples - 1 - index) / (rate * envelope.release), 1)
      const decay = envelope.decay ? Math.exp(-time / envelope.decay) : 1
      let tone = 0
      for (const [ratio, level] of usablePartials) tone += Math.sin(phase * ratio) * level
      data[start + index] += tone * fade * decay * strength
    }
  }

  let maximum = 0
  for (const value of data) maximum = Math.max(maximum, Math.abs(value))
  if (maximum > 0) {
    const scale = peak / maximum
    for (let index = 0; index < data.length; index++) data[index] *= scale
  }
  return buffer
}
