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

export class BitwardenFolderNotFoundError extends Error {}
