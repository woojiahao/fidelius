import type { BitwardenCredentials } from '@/clients/bitwarden-client'
import Storage from '@/storage/storage'
import { StoredCredentials } from '@/storage/stored-credentials'

const IDB_NAME = 'fidelius'
const OBJECT_STORE_NAME = 'settings'
const OBJECT_STORE_QUERY = 'credentials'

export class BitwardenCredentialsStore extends Storage<
  StoredCredentials<BitwardenCredentials>
> {
  constructor() {
    super(IDB_NAME, OBJECT_STORE_NAME)
  }

  async loadCredentials(): Promise<StoredCredentials<BitwardenCredentials>> {
    const credentials = await super.load(OBJECT_STORE_QUERY)
    return StoredCredentials.hydrate({
      salt: credentials.salt,
      iv: credentials.iv,
      cipherText: credentials.cipherText,
    })
  }

  async hasCredentials(): Promise<boolean> {
    return !!(await this.loadCredentials())
  }

  async saveCredentials(data: StoredCredentials<BitwardenCredentials>) {
    super.save(OBJECT_STORE_QUERY, data)
  }

  async deleteCredentials() {
    super.delete(OBJECT_STORE_QUERY)
  }
}
