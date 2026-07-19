export type BitwardenUnlock = {
  success: boolean
  data: {
    noColor: boolean
    object: string
    title: string
    message: string | null
  }
}

export class BitwardenUnlockNotFoundError extends Error {}
