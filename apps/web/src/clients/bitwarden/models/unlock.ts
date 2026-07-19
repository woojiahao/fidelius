export type BitwardenUnlockDto = {
  success: boolean
  data: {
    noColor: boolean
    object: string
    title: string
    message: string | null
  }
}

export type BitwardenUnlock = {
  noColor: boolean
  object: string
  title: string
  message: string | null
}

export function bitwardenUnlockDtoToModel(
  dto: BitwardenUnlockDto
): BitwardenUnlock {
  const data = dto.data
  return {
    noColor: data.noColor,
    object: data.object,
    title: data.title,
    message: data.message,
  }
}

export class BitwardenUnlockNotFoundError extends Error {}
