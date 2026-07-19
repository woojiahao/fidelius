import type {
  BitwardenClient,
  BitwardenCredentials,
} from '@/clients/bitwarden/bitwarden-client'
import type { BitwardenStatus } from '@/clients/bitwarden/models/status'
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

  async status(): Promise<BitwardenStatus['data']['template']['status'] | 'unavailable'> {
    try {
      const credentials = await this.requireCredentials()
      const response = await this.client.status(credentials)
      return response.success ? response.data.template.status : 'unavailable'
    } catch {
      return 'unavailable'
    }
  }

  async setup(credentials: BitwardenCredentials) {
    await this.credentialsStore.saveCredentials(credentials)
  }

  async unlock(password: string): Promise<boolean> {
    const stored = await this.credentialsStore.loadCredentials()
    if (!stored) {
      throw new Error('Credentials have not been configured')
    }

    const { success } = await this.client.unlock(stored, password)
    return success
  }

  async clearCredentials() {
    await this.credentialsStore.deleteCredentials()
  }

  private async requireCredentials(): Promise<BitwardenCredentials> {
    const credentials = await this.credentialsStore.loadCredentials()
    if (!credentials) {
      throw new Error("Credentials not configured")
    }
    return credentials
  }
}
