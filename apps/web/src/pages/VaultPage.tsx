import type { BitwardenFolder } from '@/clients/bitwarden/models/folder'
import type { BitwardenItem } from '@/clients/bitwarden/models/item'
import type { BitwardenStatus } from '@/clients/bitwarden/models/status'
import { useBitwardenFolders } from '@/clients/bitwarden/queries/useBitwardenFolders'
import { useBitwardenItems } from '@/clients/bitwarden/queries/useBitwardenItems'
import { useBitwardenStatus } from '@/clients/bitwarden/queries/useBitwardenStatus'
import { FilesCard } from '@/components/fidelius/FilesCard'
import { FoldersCard } from '@/components/fidelius/FoldersCard'
import { MoveToFolderConfirmationDialog } from '@/components/fidelius/MoveToFolderConfirmationDialog'
import { ThemeToggle } from '@/components/fidelius/ThemeToggle'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Spinner } from '@/components/ui/spinner'
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
        <div className="w-full flex flex-col items-center gap-4">
          <Spinner />
          <p>Loading your vault</p>
        </div>
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
  const [
    moveToFolderConfirmationDialogOpen,
    setMoveToFolderConfirmationDialogOpen,
  ] = useState(false)
  const [
    moveToFolderConfirmationDialogFolder,
    setMoveToFolderConfirmationDialogFolder,
  ] = useState<BitwardenFolder>()

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
    setSelectedItems(
      selectedItems.length > 0 ? [] : items.map((item) => item.id)
    )
  }, [selectedItems, items])

  const onRelease = useCallback(
    (folder: BitwardenFolder) => () => {
      setMoveToFolderConfirmationDialogOpen(true)
      setMoveToFolderConfirmationDialogFolder(folder)
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
        <FoldersCard folders={folders} onRelease={onRelease} />
        <FilesCard
          items={items}
          folders={folders}
          selectedItems={selectedItems}
          selectItem={selectItem}
          toggleSelectAll={toggleSelectAll}
          clearSelectedItems={clearSelectedItems}
        />
      </div>
      {moveToFolderConfirmationDialogFolder != null && (
        <MoveToFolderConfirmationDialog
          open={moveToFolderConfirmationDialogOpen}
          selectedItems={selectedItems}
          itemNames={Object.fromEntries(
            items.map((item) => [item.id, item.name])
          )}
          folder={moveToFolderConfirmationDialogFolder}
          setOpen={setMoveToFolderConfirmationDialogOpen}
          clearSelectedItems={clearSelectedItems}
        />
      )}
    </div>
  )
}
