import {
  ServerUnavailableError,
  UnexpectedResponseError,
} from '@/clients/bitwarden/errors'

type Headers = { [key: string]: string }

export abstract class Client<Credentials> {
  private readonly url: string

  constructor(url: string) {
    this.url = url
  }

  protected abstract headers(credentials: Credentials, url: string): Headers

  protected async get(
    credentials: Credentials,
    path: string
  ): Promise<Response> {
    try {
      return await fetch(new URL(path, this.url), {
        method: 'GET',
        headers: this.setupHeaders(credentials, {}),
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  protected async post<T extends object>(
    credentials: Credentials,
    path: string,
    body: T,
    init?: RequestInit
  ): Promise<Response> {
    try {
      return await fetch(new URL(path, this.url), {
        ...init,
        body: JSON.stringify(body),
        method: 'POST',
        headers: this.setupHeaders(credentials, {
          'Content-Type': 'application/json',
        }),
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  protected async put<T extends object>(
    credentials: Credentials,
    path: string,
    body: T,
    init?: RequestInit
  ): Promise<Response> {
    try {
      return await fetch(new URL(path, this.url), {
        ...init,
        body: JSON.stringify(body),
        method: 'PUT',
        headers: this.setupHeaders(credentials, {
          'Content-Type': 'application/json',
        }),
      })
    } catch {
      throw new ServerUnavailableError()
    }
  }

  protected async expectJson<T>(
    response: Response,
    expectedStatus: number = 200
  ): Promise<T> {
    if (response.status !== expectedStatus) {
      throw new UnexpectedResponseError(response.status, await response.text())
    }

    return response.json()
  }

  private setupHeaders(credentials: Credentials, headers: Headers): Headers {
    const customHeaders = this.headers(credentials, this.url)
    return { ...headers, ...customHeaders }
  }
}
