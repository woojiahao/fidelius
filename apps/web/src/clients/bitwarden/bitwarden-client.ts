import {
  BadRequestError,
  ServerUnavailableError,
  UnexpectedResponseError,
} from '@/clients/bitwarden/errors'
import {
  BitwardenStatusNotFoundError,
  type BitwardenStatus,
} from '@/clients/bitwarden/models/status'
import {
  BitwardenUnlockNotFoundError,
  type BitwardenUnlock,
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

    return this.expectJson<BitwardenStatus>(response)
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

    return this.expectJson<BitwardenUnlock>(response)
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

    return this.expectJson<BitwardenUnlock>(response)
  }

  private async get(
    credentials: BitwardenCredentials,
    path: string
  ): Promise<Response> {
    try {
      // TODO: Support localhost or production URL
      return await fetch(new URL(path, "http://localhost:3000"), {
        method: 'GET',
        headers: {
          "X-Bitwarden-Url": credentials.serverUrl
        }
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
      return await fetch(new URL(path, "http://localhost:3000"), {
        ...init,
        body: JSON.stringify(body),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "X-Bitwarden-Url": credentials.serverUrl
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
