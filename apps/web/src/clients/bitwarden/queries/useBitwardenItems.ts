import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'

export function useBitwardenItems() {
  const { service } = useAuth()
  return useQuery({
    queryKey: ['items'],
    queryFn: () => service.items(),
  })
}
