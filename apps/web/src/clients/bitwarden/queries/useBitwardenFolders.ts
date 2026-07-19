import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'

export function useBitwardenFolders() {
  const { service } = useAuth()
  return useQuery({
    queryKey: ['folders'],
    queryFn: () => service.folders(),
  })
}
