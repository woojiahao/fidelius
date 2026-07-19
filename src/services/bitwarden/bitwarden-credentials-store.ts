import type { BitwardenCredentials } from '@/clients/bitwarden/bitwarden-client'
import Storage from '@/storage/storage'

const IDB_NAME = 'fidelius'
const OBJECT_STORE_NAME = 'settings'
const OBJECT_STORE_QUERY = 'credentials'

export class BitwardenCredentialsStore extends Storage<BitwardenCredentials> {
  constructor() {
    super(IDB_NAME, OBJECT_STORE_NAME)
  }

  async loadCredentials(): Promise<BitwardenCredentials | null> {
    return await super.load(OBJECT_STORE_QUERY)
  }

  async hasCredentials(): Promise<boolean> {
    return !!(await this.loadCredentials())
  }

  async saveCredentials(data: BitwardenCredentials) {
    super.save(OBJECT_STORE_QUERY, data)
  }

  async deleteCredentials() {
    super.delete(OBJECT_STORE_QUERY)
  }
}
