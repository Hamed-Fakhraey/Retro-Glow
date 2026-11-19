export {}

declare global {
  interface Window {
    retroGlowDesktop?: {
      showWindow: () => Promise<void>
      quit: () => Promise<void>
      getLaunchAtStartup: () => Promise<boolean | null>
      setLaunchAtStartup: (enabled: boolean) => Promise<boolean | null>
      alertFired: (kind: 'alarm' | 'timer') => Promise<void>
    }
  }
}
