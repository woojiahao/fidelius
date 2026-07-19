export type BitwardenStatus = {
  success: boolean
  data: {
    object: 'template'
    template: {
      serverUrl: string | null
      lastSync: string | null
      userEmail: string | null
      userId: string | null
      status: 'locked' | 'unlocked' | 'unauthenticated'
    }
  }
}

export class BitwardenStatusNotFoundError extends Error {}
