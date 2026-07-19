import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'

export function useBitwardenStatus() {
  const { service } = useAuth()
  return useQuery({
    queryKey: ['status'],
    queryFn: () => service.status(),
  })
}
