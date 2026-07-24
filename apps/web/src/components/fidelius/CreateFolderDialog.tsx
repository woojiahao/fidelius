import { useBitwardenCreateFolder } from '@/clients/bitwarden/mutations/useBitwardenCreateFolder'
import { FolderPlusIcon } from '@/components/icons/lucide-folder-plus'
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
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useState, useCallback } from 'react'

export function CreateFolderDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [folderName, setFolderName] = useState<string>()
  const createFolderMutation = useBitwardenCreateFolder()

  const createFolder = useCallback(async () => {
    if (folderName == null || folderName.length === 0) {
      return
    }

    setLoading(true)
    await createFolderMutation.mutateAsync({
      folderName: folderName,
    })

    setLoading(false)
    setOpen(false)
  }, [createFolderMutation])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" onClick={() => setOpen(true)} size="xs">
            <FolderPlusIcon />
            New Folder
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Create a new folder</DialogTitle>
        <DialogDescription>
          Use the{' '}
          <code>
            <strong>parent/child/grandchild</strong>
          </code>{' '}
          convention.
        </DialogDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="folder-name">Folder name</FieldLabel>
            <Input
              id="folder-name"
              name="folder-name"
              type="folder-name"
              placeholder="Folder name"
              required
              onChange={(event) => setFolderName(event.target.value)}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <ButtonGroup>
            <Button onClick={() => createFolder()} disabled={loading}>
              {loading ? <Spinner /> : 'Create folder'}
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
