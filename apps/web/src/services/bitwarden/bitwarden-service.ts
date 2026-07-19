import type {
  BitwardenClient,
  BitwardenCredentials,
} from '@/clients/bitwarden/bitwarden-client'
import {
  bitwardenFoldersDtoToModel,
  type BitwardenFolder,
} from '@/clients/bitwarden/models/folder'
import {
  bitwardenItemsDtoToModel,
  type BitwardenItem,
} from '@/clients/bitwarden/models/item'
import {
  bitwardenStatusDtoToModel,
  type BitwardenStatus,
} from '@/clients/bitwarden/models/status'
import type { BitwardenCredentialsStore } from '@/services/bitwarden/bitwarden-credentials-store'

export class BitwardenService {
  private readonly credentialsStore: BitwardenCredentialsStore
  private readonly client: BitwardenClient

  constructor(
    credentialStore: BitwardenCredentialsStore,
    client: BitwardenClient
  ) {
    this.credentialsStore = credentialStore
    this.client = client
  }

  async hasCredentials(): Promise<boolean> {
    return await this.credentialsStore.hasCredentials()
  }

  async vaultStatus(): Promise<BitwardenStatus['status'] | 'unavailable'> {
    try {
      const credentials = await this.requireCredentials()
      const response = await this.client.status(credentials)
      const model = bitwardenStatusDtoToModel(response)
      return response.success ? model.status : 'unavailable'
    } catch {
      return 'unavailable'
    }
  }

  async status(): Promise<BitwardenStatus> {
    const credentials = await this.requireCredentials()
    return bitwardenStatusDtoToModel(await this.client.status(credentials))
  }

  async folders(): Promise<BitwardenFolder[]> {
    const credentials = await this.requireCredentials()
    return bitwardenFoldersDtoToModel(await this.client.folders(credentials))
  }

  async items(): Promise<BitwardenItem[]> {
    const credentials = await this.requireCredentials()
    return bitwardenItemsDtoToModel(await this.client.items(credentials))
  }

  async moveItemToFolder(itemId: string, folderId: string) {
    const credentials = await this.requireCredentials()
    await this.client.moveItemToFolder(credentials, itemId, folderId)
  }

  async setup(credentials: BitwardenCredentials) {
    await this.credentialsStore.saveCredentials(credentials)
  }

  async unlock(password: string): Promise<boolean> {
    const credentials = await this.requireCredentials()
    const { success } = await this.client.unlock(credentials, password)
    return success
  }

  async clearCredentials() {
    await this.credentialsStore.deleteCredentials()
  }

  private async requireCredentials(): Promise<BitwardenCredentials> {
    const credentials = await this.credentialsStore.loadCredentials()
    if (!credentials) {
      throw new Error('Credentials not configured')
    }
    return credentials
  }
}
