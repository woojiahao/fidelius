export class EncryptedCredentials<T> {
  readonly salt: string
  readonly iv: string
  readonly cipherText: string

  constructor(salt: string, iv: string, cipherText: string) {
    this.salt = salt
    this.iv = iv
    this.cipherText = cipherText
  }

  async decrypt(password: string): Promise<T> {
    const salt = Uint8Array.from(atob(this.salt), (c) => c.charCodeAt(0))
    const iv = Uint8Array.from(atob(this.iv), (c) => c.charCodeAt(0))

    const cipherText = Uint8Array.from(atob(this.cipherText), (c) =>
      c.charCodeAt(0)
    )

    const key = await EncryptedCredentials.deriveKey(password, salt)

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      cipherText
    )

    return JSON.parse(new TextDecoder().decode(decrypted))
  }

  static async from<T>(
    password: string,
    credentials: T
  ): Promise<EncryptedCredentials<T>> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const key = await this.deriveKey(password, salt)

    const plainText = new TextEncoder().encode(JSON.stringify(credentials))

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      plainText
    )

    return new EncryptedCredentials<T>(
      btoa(String.fromCharCode(...salt)),
      btoa(String.fromCharCode(...iv)),
      btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    )
  }

  static hydrate<T>(credentials: {
    salt: string
    iv: string
    cipherText: string
  }): EncryptedCredentials<T> {
    return new EncryptedCredentials(
      credentials.salt,
      credentials.iv,
      credentials.cipherText
    )
  }

  private static async deriveKey(
    password: string,
    salt: BufferSource
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 250_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      false,
      ['encrypt', 'decrypt']
    )
  }
}
