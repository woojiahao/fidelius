import {
  BitwardenClient,
  type BitwardenCredentials,
} from '@/clients/bitwarden-client'
import { BitwardenCredentialsStore } from '@/services/bitwarden/bitwarden-credentials-store'
import { BitwardenService } from '@/services/bitwarden/bitwarden-service'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

type AuthState =
  | { status: 'loading' }
  | { status: 'setup' }
  | { status: 'locked' }
  | { status: 'authenticated'; accessToken: string; expiresAt: number }

type AuthContextState = {
  state: AuthState
  setup(password: string, credentials: BitwardenCredentials): Promise<void>
  unlock(password: string): Promise<void>
  logout(): void
  forgetDevice(): Promise<void>
}

const initialState: AuthContextState = {
  state: { status: 'loading' },
  setup: async () => {},
  unlock: async () => {},
  logout: () => {},
  forgetDevice: async () => {},
}

const AuthContext = createContext<AuthContextState>(initialState)

export function AuthProvider({ children }: PropsWithChildren<object>) {
  const bitwardenCredentialsStore = useMemo(
    () => new BitwardenCredentialsStore(),
    []
  )
  const bitwardenClient = useMemo(() => new BitwardenClient(), [])
  const bitwardenService = useMemo(
    () => new BitwardenService(bitwardenCredentialsStore, bitwardenClient),
    [bitwardenClient, bitwardenCredentialsStore]
  )

  const [state, setState] = useState<AuthState>({
    status: 'loading',
  })

  useEffect(() => {
    ;(async () => {
      const hasCredentials = await bitwardenService.hasCredentials()
      console.log(hasCredentials)
      setState({
        status: hasCredentials ? 'locked' : 'setup',
      })
    })()
  }, [bitwardenService])

  const setup = useCallback(
    async (password: string, credentials: BitwardenCredentials) => {
      await bitwardenService.setup(password, credentials)
      setState({
        status: 'locked',
      })
    },
    [bitwardenService]
  )

  const unlock = useCallback(
    async (password: string) => {
      const token = await bitwardenService.unlock(password)

      setState({
        status: 'authenticated',
        accessToken: token.accessToken,
        expiresAt: Date.now() + token.expiresIn * 1000,
      })
    },
    [bitwardenService]
  )

  const logout = useCallback(() => {
    setState({ status: 'locked' })
  }, [])

  const forgetDevice = useCallback(async () => {
    await bitwardenService.clearCredentials()
    setState({ status: 'locked' })
  }, [bitwardenService])

  return (
    <AuthContext.Provider
      value={{
        state,
        setup,
        unlock,
        logout,
        forgetDevice,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
