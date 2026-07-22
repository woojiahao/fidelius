import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import type { BitwardenItem } from '@/clients/bitwarden/models/item'
import { MoveToFolderDialog } from '@/components/fidelius/MoveToFolderDialog'
import { KeySquareIcon } from '@/components/icons/lucide-key-square'
import { PersonStandingIcon } from '@/components/icons/lucide-person-standing'
import { StickyNoteIcon } from '@/components/icons/lucide-sticky-note'
import { WalletCardsIcon } from '@/components/icons/lucide-wallet-cards'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useCallback, useMemo } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

type FilesCardProps = {
  items: BitwardenItem[]
  folders: BitwardenFolder[]
  selectedItems: string[]
  selectItem: (item: BitwardenItem) => () => void
  toggleSelectAll: () => void
  clearSelectedItems: () => void
}

export function FilesCard({
  items,
  folders,
  selectedItems,
  selectItem,
  toggleSelectAll,
  clearSelectedItems,
}: FilesCardProps) {
  const folderNames = useMemo(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder.name])),
    [folders]
  )

  const itemNames = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item.name])),
    [items]
  )

  const folderItems = useMemo(
    () =>
      folders.map((folder) => ({
        label: folder.name,
        value: folder.id,
      })),
    [folders]
  )

  const onDragStart = useCallback(
    (event: React.DragEvent) => {
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '-10000px'
      document.body.appendChild(container)
      const root = createRoot(container)
      flushSync(() => {
        root.render(
          <DragPreview
            selectedItems={items.filter((item) =>
              selectedItems.includes(item.id)
            )}
          />
        )
      })
      event.dataTransfer.setDragImage(container, 16, 16)
      const cleanup = () => {
        root.unmount()
        container.remove()
      }

      event.dataTransfer.setData('items', JSON.stringify(selectedItems))
      event.currentTarget.addEventListener('dragend', cleanup, { once: true })
    },
    [selectedItems]
  )

  return (
    <Card className="flex-2">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2 items-center">
          <Checkbox
            onCheckedChange={toggleSelectAll}
            checked={selectedItems.length > 0}
          />
          Items
          {selectedItems.length > 0 && ` (${selectedItems.length} selected)`}
        </CardTitle>
        <CardAction>
          {selectedItems.length > 0 && (
            <ButtonGroup>
              <MoveToFolderDialog
                showText
                folderItems={folderItems}
                selectedItems={selectedItems}
                itemNames={itemNames}
                clearSelectedItems={clearSelectedItems}
              />
            </ButtonGroup>
          )}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {items.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            folders={folderNames}
            checked={selectedItems.includes(item.id)}
            selectItem={selectItem(item)}
            folderItems={folderItems}
            clearSelectedItems={clearSelectedItems}
            onDragStart={onDragStart}
          />
        ))}
      </CardContent>
    </Card>
  )
}

type ItemRowProps = {
  item: BitwardenItem
  folders: { [key: string]: string }
  checked: boolean
  folderItems: { label: string; value: string }[]
  selectItem: () => void
  clearSelectedItems: () => void
  onDragStart: (event: React.DragEvent) => void
}

function ItemRow({
  item,
  folders,
  checked,
  folderItems,
  selectItem,
  clearSelectedItems,
  onDragStart,
}: ItemRowProps) {
  return (
    <div
      className="flex flex-row justify-between w-full rounded-md px-4 py-2 bg-muted items-center"
      onClick={selectItem}
      draggable={checked}
      onDragStart={onDragStart}
    >
      <div className="flex flex-row gap-3 items-center">
        <Checkbox onCheckedChange={selectItem} checked={checked} />
        {item.type === 'card' && <WalletCardsIcon width={16} />}
        {item.type === 'secure-note' && <StickyNoteIcon width={16} />}
        {item.type === 'login' && <KeySquareIcon width={16} />}
        {item.type === 'identity' && <PersonStandingIcon width={16} />}
        <div className="flex flex-col gap-1">
          <p className="text-base">{item.name}</p>
          {item.folderId != null && (
            <p className="text-xs text-muted-foreground">
              {folders[item.folderId]}
            </p>
          )}
        </div>
      </div>

      <ButtonGroup>
        <MoveToFolderDialog
          showText={false}
          folderItems={folderItems}
          selectedItems={[item.id]}
          itemNames={{ [item.id]: item.name }}
          clearSelectedItems={clearSelectedItems}
        />
      </ButtonGroup>
    </div>
  )
}

function DragPreview({ selectedItems }: { selectedItems: BitwardenItem[] }) {
  if (selectedItems.length === 1) {
    return (
      <div className="w-80">
        <DragPreviewRow item={selectedItems[0]} />
      </div>
    )
  }

  const previewItems = selectedItems.slice(0, 3)

  return (
    <div className="relative h-24 w-80">
      {[...previewItems].reverse().map((item, index) => {
        const offset = (previewItems.length - 1 - index) * 6

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              top: offset,
              left: offset,
              right: offset,
              zIndex: index,
            }}
          >
            <DragPreviewRow item={item} />
          </div>
        )
      })}

      <div className="absolute -top-2 -right-2 z-50 flex h-7 min-w-7 items-center justify-center rounded-full bg-destructive px-2 text-sm font-semibold text-destructive-foreground shadow-lg">
        {selectedItems.length}
      </div>
    </div>
  )
}

function DragPreviewRow({ item }: { item: BitwardenItem }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted px-4 py-2 shadow-lg">
      {item.type === 'card' && <WalletCardsIcon width={16} />}
      {item.type === 'secure-note' && <StickyNoteIcon width={16} />}
      {item.type === 'login' && <KeySquareIcon width={16} />}
      {item.type === 'identity' && <PersonStandingIcon width={16} />}

      <span className="truncate text-base">{item.name}</span>
    </div>
  )
}
