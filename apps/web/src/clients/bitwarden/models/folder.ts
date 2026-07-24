export type BitwardenFoldersDto = {
  success: boolean
  data: {
    object: 'list'
    data: {
      name: string
      object: 'folder'
      id: string
    }[]
  }
}

export type BitwardenFolderDto = {
  success: boolean
  data: {
    object: 'folder'
    data: {
      object: 'folder'
      id: string
      name: string
    }
  }
}

export type BitwardenFolder = {
  name: string
  id: string
}

export function bitwardenFoldersDtoToModel(
  dto: BitwardenFoldersDto
): BitwardenFolder[] {
  return dto.data.data.map((dtoFolder) => ({
    name: dtoFolder.name,
    id: dtoFolder.id,
  }))
}

export function bitwardenFolderDtoToModel(
  dto: BitwardenFolderDto
): BitwardenFolder {
  return {
    name: dto.data.data.name,
    id: dto.data.data.id,
  }
}

export class BitwardenFolderNotFoundError extends Error {}
