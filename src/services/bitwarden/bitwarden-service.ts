import type {
  BitwardenBearerToken,
  BitwardenClient,
  BitwardenCredentials,
} from '@/clients/bitwarden-client'
import type { BitwardenCredentialsStore } from '@/services/bitwarden/bitwarden-credentials-store'
import { StoredCredentials } from '@/storage/stored-credentials'

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

  async setup(password: string, credentials: BitwardenCredentials) {
    const encrypted = await StoredCredentials.from(password, credentials)

    await this.credentialsStore.saveCredentials(encrypted)
  }

  async unlock(password: string): Promise<BitwardenBearerToken> {
    const stored = await this.credentialsStore.loadCredentials()

    if (!stored) {
      throw new Error('Credentials have not been configured')
    }

    const credentials = await stored.decrypt(password)
    console.log(credentials)

    const token = await this.client.auth(credentials)

    return token
  }

  async clearCredentials() {
    await this.credentialsStore.deleteCredentials()
  }
}
