import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import { CreateFolderDialog } from '@/components/fidelius/CreateFolderDialog'
import { FolderIcon } from '@/components/icons/lucide-folder'
import { FolderOpenIcon } from '@/components/icons/lucide-folder-open'
import { FolderTreeIcon } from '@/components/icons/lucide-folder-tree'
import { FolderXIcon } from '@/components/icons/lucide-folder-x'
import { ListIcon } from '@/components/icons/lucide-list'
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
  const [treeView, setTreeView] = useState(false)

  return (
    <Card className="flex-1 h-full">
      <CardHeader>
        <CardTitle>Folders</CardTitle>
        <CardAction>
          <ButtonGroup>
            <Button
              variant="outline"
              size="xs"
              onClick={() => setTreeView((prev) => !prev)}
            >
              {treeView ? <ListIcon /> : <FolderTreeIcon />}
              {treeView ? 'Folder view' : 'Tree view'}
            </Button>
            <CreateFolderDialog />
          </ButtonGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        {treeView ? (
          <TreeFolderView folders={folders} onRelease={onRelease} />
        ) : (
          <ListFolderView folders={folders} onRelease={onRelease} />
        )}
      </CardContent>
    </Card>
  )
}

type TreeFolderViewProps = {
  folders: BitwardenFolder[]
  onRelease: (folder: BitwardenFolder) => () => void
}

function TreeFolderView({ folders, onRelease }: TreeFolderViewProps) {
  const root = groupFolders(folders)
  const nodes: React.ReactElement[] = []
  root.walk((node, segment, depth) => {
    const droppable =
      node.fullPath == null
        ? undefined
        : { onRelease: onRelease(node.fullPath) }
    nodes.push(
      <FolderRow
        key={node.fullPath?.id ?? `${segment}_${depth}`}
        folderName={segment}
        depth={depth}
        droppable={droppable}
      />
    )
  })
  console.log(nodes)

  return <div className="flex flex-col gap-2">{nodes}</div>
}

class BitwardenFolderTrie {
  private paths: { [path: string]: BitwardenFolderTrie }
  isEnd: boolean
  fullPath: BitwardenFolder | null

  constructor() {
    this.paths = {}
    this.isEnd = false
    this.fullPath = null
  }

  insert(folder: BitwardenFolder) {
    let self: BitwardenFolderTrie = this
    const parts = folder.name.replace(/\/+$/, '').split('/')
    for (const part of parts) {
      self.paths[part] ??= new BitwardenFolderTrie()
      self = self.paths[part]
    }
    self.isEnd = true
    self.fullPath = folder
  }

  walk(
    visitor: (node: BitwardenFolderTrie, segment: string, depth: number) => void
  ) {
    const visit = (node: BitwardenFolderTrie, depth: number) => {
      for (const [path, trie] of Object.entries(node.paths)) {
        visitor(trie, path, depth)
        visit(trie, depth + 1)
      }
    }
    visit(this, 0)
  }
}

function groupFolders(folders: BitwardenFolder[]) {
  const root = new BitwardenFolderTrie()
  for (const folder of folders) {
    root.insert(folder)
  }
  // root.walk((node, segment, depth) => {
  //   console.log('  '.repeat(depth) + segment + (node.isEnd ? ' (End)' : ''))
  // })
  return root
}

type ListFolderViewProps = {
  folders: BitwardenFolder[]
  onRelease: (folder: BitwardenFolder) => () => void
}

function ListFolderView({ folders, onRelease }: ListFolderViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {folders.map((folder) => (
        <FolderRow
          key={folder.id}
          folderName={folder.name}
          depth={0}
          droppable={{ onRelease: onRelease(folder) }}
        />
      ))}
    </div>
  )
}

type FolderRowProps = {
  folderName: string
  depth?: number
  droppable?: {
    onRelease: () => void
  }
}

function FolderRow({ folderName, depth = 0, droppable }: FolderRowProps) {
  const [isFolderHover, setIsFolderHover] = useState(false)

  const onDragEnter = useCallback((event: React.DragEvent) => {
    if (droppable == null) {
      return
    }

    if (event.dataTransfer?.types.includes('items')) {
      setIsFolderHover(true)
      event.preventDefault()
    }
  }, [])

  const onDragLeave = useCallback(() => {
    if (droppable == null) {
      return
    }

    setIsFolderHover(false)
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (droppable == null) {
        return
      }

      event.preventDefault()
      setIsFolderHover(false)
      droppable.onRelease()
    },
    [droppable?.onRelease]
  )

  if (droppable == null) {
    return (
      <div
        className="rounded-md px-4 py-2 bg-muted flex flex-row gap-2 items-center"
        style={{ marginLeft: `${depth * 1}rem` }}
      >
        <FolderXIcon width={16} />
        {folderName}
      </div>
    )
  }

  return (
    <div
      className="rounded-md px-4 py-2 bg-muted flex flex-row gap-2 items-center"
      style={{ marginLeft: `${depth * 1}rem` }}
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
      {folderName}
    </div>
  )
}
