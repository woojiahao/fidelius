import { Container } from '@/components/ui/container'
import { useAuth } from '@/contexts/AuthContext'
import LoadingPage from '@/pages/LoadingPage'
import LockedPage from '@/pages/LockedPage'
import SetupPage from '@/pages/SetupPage'
import { Outlet } from 'react-router'

export default function App() {
  return (
    <Container>
      <AppInner />
    </Container>
  )
}

export function AppInner() {
  const { state } = useAuth()

  switch (state) {
    case 'loading':
      return <LoadingPage />
    case 'setup':
      return <SetupPage />
    case 'locked':
      return <LockedPage />
    case 'unavailable':
      return <SetupPage message="Could not connect to server. Try to set it up again." />
    case 'connected':
      return <Outlet />
  }
}
