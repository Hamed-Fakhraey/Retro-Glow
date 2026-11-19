export const themes = [
  { id: 'neon', label: 'Dark Neon' },
  { id: 'green', label: 'Classic Retro Green' },
  { id: 'assassin-crimson', label: 'Assassin Crimson' },
  { id: 'assassin-gold', label: 'Assassin Gold / Black' },
] as const

export type Theme = (typeof themes)[number]['id']
export const themeKey = 'retroglow.theme'

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(themeKey)
    if (saved === 'assassin') return 'assassin-crimson'
    return themes.find(({ id }) => id === saved)?.id ?? 'neon'
  } catch {
    return 'neon'
  }
}
