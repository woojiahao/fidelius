export type BitwardenStatusDto = {
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

export type BitwardenStatus = {
  serverUrl: string | null
  lastSync: string | null
  userEmail: string | null
  userId: string | null
  status: 'locked' | 'unlocked' | 'unauthenticated'
}

export function bitwardenStatusDtoToModel(
  dto: BitwardenStatusDto
): BitwardenStatus {
  const template = dto.data.template
  return {
    serverUrl: template.serverUrl,
    lastSync: template.lastSync,
    userEmail: template.userEmail,
    userId: template.userId,
    status: template.status,
  }
}

export class BitwardenStatusNotFoundError extends Error {}
