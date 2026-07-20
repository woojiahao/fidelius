import { useAuth } from '@/contexts/AuthContext'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useBitwardenMoveItemToFolder() {
  const { service } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ itemId, folderId }: { itemId: string; folderId: string }) =>
      service.moveItemToFolder(itemId, folderId),
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
