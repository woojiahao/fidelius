import { useBitwardenMoveItemToFolder } from '@/clients/bitwarden/mutations/useBitwardenMoveItemToFolder'
import { FolderInputIcon } from '@/components/icons/lucide-folder-input'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { useState, useCallback } from 'react'

type MoveToFolderDialogProps = {
  selectedItems: string[]
  itemNames: { [key: string]: string }
  folderItems: { label: string; value: string }[]
  showText: boolean
  clearSelectedItems: () => void
}

export function MoveToFolderDialog({
  selectedItems,
  itemNames,
  folderItems,
  showText,
  clearSelectedItems,
}: MoveToFolderDialogProps) {
  const [open, setOpen] = useState(false)
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

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" onClick={() => setOpen(true)} size="xs">
            <FolderInputIcon />
            {showText && 'Move to folder'}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Move item(s) to folder</DialogTitle>
        <DialogDescription>
          Move the following items into the same folder:
        </DialogDescription>
        <ul>
          {selectedItems.map((itemId) => (
            <li key={itemId}>- {itemNames[itemId]}</li>
          ))}
        </ul>
        <Select items={folderItems} onValueChange={setSelectedFolderId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>
          <SelectContent>
            {folderItems.map((folderItem) => (
              <SelectItem key={folderItem.value} value={folderItem.value}>
                {folderItem.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <ButtonGroup>
            <Button
              onClick={() => moveItemsToFolder(selectedItems, selectedFolderId)}
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
