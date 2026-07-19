export class ServerUnavailableError extends Error {}

export class UnexpectedResponseError extends Error {
  constructor(status: number, body: string) {
    super(`Got ${status} with body ${body}`)
  }
}

export class BadRequestError extends Error {}
