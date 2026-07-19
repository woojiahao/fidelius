export type BitwardenItemTemplateDto = {
  id: string
  organizationId: string | null
  collectionIds: string[]
  folderId: string | null
  type: 1 | 2 | 3 | 4
  name: string
  notes: string
  favorite: boolean
  fields: {
    name: string
    value: string
    type: 0 | 1 | 2 | 3
  }[]
  login: BitwardenItemLoginDto | null
  secureNote: BitwardenItemSecureNoteDto | null
  card: BitwardenItemCardDto | null
  identity: BitwardenItemIdentityDto | null
  reprompt: 0 | 1
}

export type BitwardenItemLoginDto = {
  uris: {
    match: 0 | 1 | 2 | 3 | 4 | 5
    uri: string
  }[]
  username: string
  password: string
  totp: string
}

export type BitwardenItemSecureNoteDto = {
  type: 0
}

export type BitwardenItemCardDto = {
  cardholderName: string
  brand: string
  number: string
  expMonth: string
  expYear: string
  code: string
}

export type BitwardenItemIdentityDto = {
  title: string
  firstName: string
  middleName: string
  lastName: string
  address1: string
  address2: string
  address3: string
  city: string
  state: string
  postalCode: string
  country: string
  company: string
  email: string
  phone: string
  ssn: string
  username: string
  passportNumber: string
  licenseNumber: string
}

export type BitwardenItemsDto = {
  success: boolean
  data: {
    object: 'list'
    data: BitwardenItemTemplateDto[]
  }
}

export type BitwardenItemDto = {
  success: boolean
  data: BitwardenItemTemplateDto
}

type BitwardenItemType = 'login' | 'secure-note' | 'card' | 'identity'

function getType(item: BitwardenItemTemplateDto): BitwardenItemType {
  if (item.login != null) return 'login'
  if (item.secureNote != null) return 'secure-note'
  if (item.card != null) return 'card'
  if (item.identity != null) return 'identity'
  return 'login'
}

export type BitwardenItem = {
  id: string
  organizationId: string | null
  collectionIds: string[]
  folderId: string | null
  type: BitwardenItemType
  name: string
  favorite: boolean
}

export function bitwardenItemDtoToModel(dto: BitwardenItemDto): BitwardenItem {
  const dtoItem = dto.data

  return {
    id: dtoItem.id,
    organizationId: dtoItem.organizationId,
    collectionIds: dtoItem.collectionIds,
    folderId: dtoItem.folderId,
    type: getType(dtoItem),
    name: dtoItem.name,
    favorite: dtoItem.favorite,
  }
}

export function bitwardenItemsDtoToModel(
  dto: BitwardenItemsDto
): BitwardenItem[] {
  return dto.data.data.map((dtoItem) => ({
    id: dtoItem.id,
    organizationId: dtoItem.organizationId,
    collectionIds: dtoItem.collectionIds,
    folderId: dtoItem.folderId,
    type: getType(dtoItem),
    name: dtoItem.name,
    favorite: dtoItem.favorite,
  }))
}

export class BitwardenItemNotFoundError extends Error {}
