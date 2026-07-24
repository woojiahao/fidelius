import { useAuth } from '@/contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useBitwardenCreateFolder() {
  const { service } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ folderName }: { folderName: string }) =>
      service.createFolder(folderName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['folders'],
      })
      await queryClient.invalidateQueries({
        queryKey: ['items'],
      })
    },
  })
}
