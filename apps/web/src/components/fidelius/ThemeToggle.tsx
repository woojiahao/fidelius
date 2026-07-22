import { LaptopIcon } from '@/components/icons/lucide-laptop'
import { MoonIcon } from '@/components/icons/lucide-moon'
import { SunIcon } from '@/components/icons/lucide-sun'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  return (
    <Button variant="outline" onClick={cycleTheme}>
      {theme === 'light' && <SunIcon />}
      {theme === 'dark' && <MoonIcon />}
      {theme === 'system' && <LaptopIcon />}
    </Button>
  )
}
