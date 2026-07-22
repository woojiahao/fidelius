import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import { useBitwardenMoveItemToFolder } from '@/clients/bitwarden/mutations/useBitwardenMoveItemToFolder'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useCallback, useState } from 'react'

type MoveToFolderConfirmationDialog = {
  open: boolean
  selectedItems: string[]
  itemNames: { [key: string]: string }
  folder: BitwardenFolder
  setOpen: (open: boolean) => void
  clearSelectedItems: () => void
}

export function MoveToFolderConfirmationDialog({
  open,
  selectedItems,
  itemNames,
  folder,
  setOpen,
  clearSelectedItems,
}: MoveToFolderConfirmationDialog) {
  const [loading, setLoading] = useState(false)
  const moveItemToFolderMutation = useBitwardenMoveItemToFolder()

  const moveItemsToFolder = useCallback(
    async (items: string[], folderId: string | null) => {
      setLoading(true)
      for (const item of items) {
        await moveItemToFolderMutation.mutateAsync({
          itemId: item,
          folderId: folderId ?? '',
        })
      }

      setLoading(false)
      setOpen(false)
      clearSelectedItems()
    },
    [moveItemToFolderMutation]
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Move item(s) to folder</DialogTitle>
        <DialogDescription>
          Move the following items into{' '}
          <code>
            <strong>{folder.name}</strong>
          </code>
          :
        </DialogDescription>
        <ul>
          {selectedItems.map((itemId) => (
            <li key={itemId}>- {itemNames[itemId]}</li>
          ))}
        </ul>
        <DialogFooter>
          <ButtonGroup>
            <Button
              onClick={() => moveItemsToFolder(selectedItems, folder.id)}
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Move to folder'}
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
