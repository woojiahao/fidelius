import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import type { BitwardenItem } from '@/clients/bitwarden/models/item'
import type { BitwardenStatus } from '@/clients/bitwarden/models/status'
import { useBitwardenMoveItemToFolder } from '@/clients/bitwarden/mutations/useBitwardenMoveItemToFolder'
import { useBitwardenFolders } from '@/clients/bitwarden/queries/useBitwardenFolders'
import { useBitwardenItems } from '@/clients/bitwarden/queries/useBitwardenItems'
import { useBitwardenStatus } from '@/clients/bitwarden/queries/useBitwardenStatus'
import { FolderIcon } from '@/components/icons/lucide-folder'
import { FolderInputIcon } from '@/components/icons/lucide-folder-input'
import { FolderPlusIcon } from '@/components/icons/lucide-folder-plus'
import { FolderTreeIcon } from '@/components/icons/lucide-folder-tree'
import { KeySquareIcon } from '@/components/icons/lucide-key-square'
import { LaptopIcon } from '@/components/icons/lucide-laptop'
import { MoonIcon } from '@/components/icons/lucide-moon'
import { PersonStandingIcon } from '@/components/icons/lucide-person-standing'
import { StickyNoteIcon } from '@/components/icons/lucide-sticky-note'
import { SunIcon } from '@/components/icons/lucide-sun'
import { WalletCardsIcon } from '@/components/icons/lucide-wallet-cards'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useTheme } from '@/contexts/ThemeContext'
import { useCallback, useMemo, useState } from 'react'

export default function VaultPage() {
  const { data: statusData, isLoading: statusLoading } = useBitwardenStatus()
  const { data: foldersData, isLoading: foldersLoading } = useBitwardenFolders()
  const { data: itemsData, isLoading: itemsLoading } = useBitwardenItems()

  const isLoading = useMemo(
    () => statusLoading || foldersLoading || itemsLoading,
    [statusLoading, foldersLoading, itemsLoading]
  )

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <VaultPageInner
          status={statusData!}
          folders={foldersData!}
          items={itemsData!}
        />
      )}
    </div>
  )
}

type VaultPageInnerProps = {
  status: BitwardenStatus
  folders: BitwardenFolder[]
  items: BitwardenItem[]
}

function VaultPageInner({ status, folders, items }: VaultPageInnerProps) {
  const folderNames = useMemo(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder.name])),
    [folders]
  )

  const itemNames = useMemo(
    () => Object.fromEntries(items.map((item) => [item.id, item.name])),
    [items]
  )

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const selectItem = useCallback(
    (item: BitwardenItem) => () => {
      setSelectedItems((prev) =>
        prev.some((i) => i === item.id)
          ? prev.filter((i) => i !== item.id)
          : [...prev, item.id]
      )
    },
    []
  )

  const clearSelectedItems = useCallback(() => {
    setSelectedItems([])
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.length > 0) {
      // Unselect them all first
      setSelectedItems([])
    } else {
      // Select everything
      setSelectedItems(items.map(item => item.id))
    }
  }, [selectedItems, items])

  return (
    <div>
      <header className="flex flex-row justify-between items-center mb-8">
        <p>{status.userEmail}</p>
        <div>
          <ButtonGroup>
            <ButtonGroup>
              <Button>Lock Vault</Button>
              <Button variant="destructive">Forget Me</Button>
              <Button variant="secondary">Logout</Button>
            </ButtonGroup>
            <ButtonGroup>
              <ThemeToggle />
            </ButtonGroup>
          </ButtonGroup>
        </div>
      </header>
      <div className="flex flex-row gap-6">
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
              <FolderRow key={folder.id} folder={folder} />
            ))}
          </CardContent>
        </Card>
        <Card className="flex-2">
          <CardHeader>
            <CardTitle className="flex flex-row gap-2 items-center">
              <Checkbox onCheckedChange={toggleSelectAll} checked={selectedItems.length > 0} />
              Items
              {selectedItems.length > 0 &&
                ` (${selectedItems.length} selected)`}
            </CardTitle>
            <CardAction>
              {selectedItems.length > 0 && (
                <ButtonGroup>
                  <MoveToFolderDialog
                    folderItems={folders.map((folder) => ({
                      label: folder.name,
                      value: folder.id,
                    }))}
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
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MoveToFolderDialog({
  selectedItems,
  itemNames,
  folderItems,
  clearSelectedItems
}: {
  selectedItems: string[]
  itemNames: { [key: string]: string }
  folderItems: { label: string; value: string }[]
  clearSelectedItems: () => void
}) {
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
            Move to folder
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
              {loading ? <Spinner /> : "Move to folder"}
            </Button>
          </ButtonGroup>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ThemeToggle() {
  const { theme, cycleTheme } = useTheme()

  return (
    <Button variant="outline" onClick={cycleTheme}>
      {theme === 'light' && <SunIcon />}
      {theme === 'dark' && <MoonIcon />}
      {theme === 'system' && <LaptopIcon />}
    </Button>
  )
}

function FolderRow({ folder }: { folder: BitwardenFolder }) {
  return (
    <div className="rounded-md px-4 py-2 bg-muted flex flex-row gap-2 items-center">
      <FolderIcon width={16} />
      {folder.name}
    </div>
  )
}

function ItemRow({
  item,
  folders,
  checked,
  selectItem,
}: {
  item: BitwardenItem
  folders: { [key: string]: string }
  checked: boolean
  selectItem: () => void
}) {
  return (
    <div
      className="flex flex-row justify-between w-full rounded-md px-4 py-2 bg-muted items-center"
      onClick={selectItem}
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
        <Button variant="outline">
          <FolderInputIcon />
        </Button>
      </ButtonGroup>
    </div>
  )
}
