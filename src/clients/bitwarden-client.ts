export type BitwardenCredentials = {
  clientId: string
  clientSecret: string
}

export type BitwardenBearerToken = {
  accessToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

export class BitwardenClient {
  async auth(credentials: BitwardenCredentials): Promise<BitwardenBearerToken> {
    console.log(credentials)
    const response = await fetch(
      'https://identity.bitwarden.com/connect/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          scope: 'api',
          client_id: credentials.clientId,
          client_secret: credentials.clientSecret,
        }),
      }
    )

    const token = await response.json()

    return {
      accessToken: token['access_token'],
      expiresIn: token['expires_in'],
      tokenType: 'Bearer',
    }
  }
}
