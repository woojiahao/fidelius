import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import type { BitwardenItem } from '@/clients/bitwarden/models/item'
import type { BitwardenStatus } from '@/clients/bitwarden/models/status'
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
    []
  )

  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const selectItem = useCallback(
    (item: BitwardenItem) => () => {
      console.log('hi', item)
      setSelectedItems((prev) =>
        prev.some((i) => i === item.id)
          ? prev.filter((i) => i !== item.id)
          : [...prev, item.id]
      )
    },
    []
  )

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
                <Button variant="outline">
                  <FolderTreeIcon />
                  Tree view
                </Button>
                <Button variant="outline">
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
            <CardTitle>
              Items
              {selectedItems.length > 0 &&
                ` (${selectedItems.length} selected)`}
            </CardTitle>
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
        <Checkbox checked={checked} />
        {item.type === 'card' && <WalletCardsIcon width={16} />}
        {item.type === 'secure-note' && <StickyNoteIcon width={16} />}
        {item.type === 'login' && <KeySquareIcon width={16} />}
        {item.type === 'identity' && <PersonStandingIcon width={16} />}
        <div className="flex flex-col gap-1">
          <p className="text-base">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {folders[item.folderId]}
          </p>
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
