import {
  BadRequestError,
  ServerUnavailableError,
  UnexpectedResponseError,
} from '@/clients/bitwarden/errors'
import {
  BitwardenFolderNotFoundError,
  type BitwardenFoldersDto,
} from '@/clients/bitwarden/models/folder'
import {
  BitwardenItemNotFoundError,
  type BitwardenItemDto,
  type BitwardenItemsDto,
} from '@/clients/bitwarden/models/item'
import {
  BitwardenStatusNotFoundError,
  type BitwardenStatusDto,
} from '@/clients/bitwarden/models/status'
import {
  BitwardenUnlockNotFoundError,
  type BitwardenUnlockDto,
} from '@/clients/bitwarden/models/unlock'

export type BitwardenCredentials = {
  serverUrl: string
}

export class BitwardenClient {
  async status(credentials: BitwardenCredentials) {
    const response = await this.get(credentials, 'status')

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenStatusNotFoundError()
    }

    return this.expectJson<BitwardenStatusDto>(response)
  }

  async lock(credentials: BitwardenCredentials, password: string) {
    const response = await this.post(credentials, 'lock', {
      password,
    })

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenUnlockNotFoundError()
    }

    return this.expectJson<BitwardenUnlockDto>(response)
  }

  async unlock(credentials: BitwardenCredentials, password: string) {
    const response = await this.post(credentials, 'unlock', {
      password,
    })

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenUnlockNotFoundError()
    }

    return this.expectJson<BitwardenUnlockDto>(response)
  }

  async folders(
    credentials: BitwardenCredentials
  ): Promise<BitwardenFoldersDto> {
    const response = await this.get(credentials, '/list/object/folders')

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenFolderNotFoundError()
    }

    return this.expectJson<BitwardenFoldersDto>(response)
  }

  async items(credentials: BitwardenCredentials): Promise<BitwardenItemsDto> {
    const response = await this.get(credentials, '/list/object/items')

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenItemNotFoundError()
    }

    return this.expectJson<BitwardenItemsDto>(response)
  }

  async item(
    credentials: BitwardenCredentials,
    itemId: string
  ): Promise<BitwardenItemDto> {
    const response = await this.get(credentials, `/object/item/${itemId}`)

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenItemNotFoundError()
    }

    return this.expectJson<BitwardenItemDto>(response)
  }

  async moveItemToFolder(
    credentials: BitwardenCredentials,
    itemId: string,
    folderId: string
  ) {
    const item = await this.item(credentials, itemId)
    if (!item.success) {
      throw new BadRequestError()
    }

    const currentItem = item.data
    currentItem.folderId = folderId

    const response = await this.put(credentials, `/object/item/${itemId}`, {
      ...currentItem,
    })

    switch (response.status) {
      case 400:
        throw new BadRequestError()
      case 404:
        throw new BitwardenItemNotFoundError()
    }

    return this.expectJson<BitwardenItemsDto>(response)
  }

  private async get(
    credentials: BitwardenCredentials,
    path: string
  ): Promise<Response> {
    try {
      // TODO: Support localhost or production URL
      return await fetch(new URL(path, 'http://localhost:3000'), {
        method: 'GET',
        headers: {
          'X-Bitwarden-Url': credentials.serverUrl,
        },
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  private async post<T extends object>(
    credentials: BitwardenCredentials,
    path: string,
    body: T,
    init?: RequestInit
  ): Promise<Response> {
    try {
      // TODO: Support localhost or production URL
      return await fetch(new URL(path, 'http://localhost:3000'), {
        ...init,
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Bitwarden-Url': credentials.serverUrl,
        },
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  private async put<T extends object>(
    credentials: BitwardenCredentials,
    path: string,
    body: T,
    init?: RequestInit
  ): Promise<Response> {
    try {
      // TODO: Support localhost or production URL
      return await fetch(new URL(path, 'http://localhost:3000'), {
        ...init,
        body: JSON.stringify(body),
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Bitwarden-Url': credentials.serverUrl,
        },
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  private async expectJson<T>(
    response: Response,
    expectedStatus: number = 200
  ): Promise<T> {
    if (response.status !== expectedStatus) {
      throw new UnexpectedResponseError(response.status, await response.text())
    }

    return response.json()
  }
}
