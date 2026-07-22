import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import { FolderIcon } from '@/components/icons/lucide-folder'
import { FolderOpenIcon } from '@/components/icons/lucide-folder-open'
import { FolderPlusIcon } from '@/components/icons/lucide-folder-plus'
import { FolderTreeIcon } from '@/components/icons/lucide-folder-tree'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { useCallback, useState } from 'react'

type FoldersCardProps = {
  folders: BitwardenFolder[]
  onRelease: (folder: BitwardenFolder) => () => void
}

export function FoldersCard({ folders, onRelease }: FoldersCardProps) {
  return (
    <Card className="flex-1 h-full">
      <CardHeader>
        <CardTitle>Folders</CardTitle>
        <CardAction>
          <ButtonGroup>
            <Button variant="outline" size="xs">
              <FolderTreeIcon />
              Tree view
            </Button>
            <Button variant="outline" size="xs">
              <FolderPlusIcon />
              New Folder
            </Button>
          </ButtonGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {folders.map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            onRelease={onRelease(folder)}
          />
        ))}
      </CardContent>
    </Card>
  )
}

type FolderRowProps = {
  folder: BitwardenFolder
  onRelease: () => void
}

function FolderRow({ folder, onRelease }: FolderRowProps) {
  const [isFolderHover, setIsFolderHover] = useState(false)

  const onDragEnter = useCallback((event: React.DragEvent) => {
    if (event.dataTransfer?.types.includes('items')) {
      setIsFolderHover(true)
      event.preventDefault()
    }
  }, [])

  const onDragLeave = useCallback(() => {
    setIsFolderHover(false)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsFolderHover(false)
      onRelease()
    },
    [onRelease]
  )

  return (
    <div
      className="rounded-md px-4 py-2 bg-muted flex flex-row gap-2 items-center"
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      {isFolderHover ? (
        <FolderOpenIcon width={16} />
      ) : (
        <FolderIcon width={16} />
      )}
      {folder.name}
    </div>
  )
}
