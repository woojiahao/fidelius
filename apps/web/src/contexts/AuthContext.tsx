import {
  BitwardenClient,
  type BitwardenCredentials,
} from '@/clients/bitwarden/bitwarden-client'
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

type AuthState = 'loading' | 'setup' | 'locked' | 'unavailable' | 'connected'

type AuthContextState = {
  state: AuthState
  service: BitwardenService

  setup(credentials: BitwardenCredentials): Promise<void>
  unlock(password: string): Promise<void>
  logout(): void
  forgetDevice(): Promise<void>
}

const initialState: AuthContextState = {
  state: 'loading',
  service: {} as BitwardenService,
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

  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    ;(async () => {
      const hasCredentials = await bitwardenService.hasCredentials()
      if (!hasCredentials) {
        setState('setup')
        return
      }

      const status = await bitwardenService.vaultStatus()
      // If the status is anything but locked or unlocked, we should discard the existing credentials
      if (status !== 'locked' && status !== 'unlocked') {
        await bitwardenService.clearCredentials()
        setState('unavailable')
        return
      }

      setState(() => {
        switch (status) {
          case 'locked':
            return 'locked'
          case 'unlocked':
            return 'connected'
        }
      })
    })()
  }, [bitwardenService])

  const setup = useCallback(
    async (credentials: BitwardenCredentials) => {
      await bitwardenService.setup(credentials)
      const status = await bitwardenService.vaultStatus()
      setState(() => {
        switch (status) {
          case 'locked':
            return 'locked'
          case 'unlocked':
            return 'connected'
          default:
            return 'unavailable'
        }
      })
    },
    [bitwardenService]
  )

  const unlock = useCallback(
    async (password: string) => {
      const outcome = await bitwardenService.unlock(password)
      setState(outcome ? 'connected' : 'unavailable')
    },
    [bitwardenService]
  )

  const logout = useCallback(() => {
    setState('locked')
  }, [])

  const forgetDevice = useCallback(async () => {
    await bitwardenService.clearCredentials()
    setState('locked')
  }, [bitwardenService])

  return (
    <AuthContext.Provider
      value={{
        state,
        service: bitwardenService,
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
