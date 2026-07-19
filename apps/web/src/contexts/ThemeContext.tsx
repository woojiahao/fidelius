import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

type Theme = 'light' | 'dark' | 'system'

const themes: Theme[] = ['light', 'dark', 'system']

type ThemeContextProviderProps = {
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeContextState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  cycleTheme: () => void
}

const initialState: ThemeContextState = {
  theme: 'system',
  setTheme: () => {},
  cycleTheme: () => {},
}

const ThemeContext = createContext<ThemeContextState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: PropsWithChildren<ThemeContextProviderProps>) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme)
    setThemeState(theme)
  }

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    setTheme(nextTheme)
  }

  useEffect(() => {
    const root = document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider
      {...props}
      value={{
        theme,
        setTheme,
        cycleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (context == null) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
