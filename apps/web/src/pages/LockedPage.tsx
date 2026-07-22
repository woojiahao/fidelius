import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useCallback } from 'react'
import { Spinner } from '@/components/ui/spinner'

export default function LockedPage() {
  const { unlock } = useAuth()
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)

  const setupAction = useCallback(
    async (form: FormData) => {
      setLoading(true)
      const password = form.get('password')
      setError(undefined)

      if (password == null) {
        setError('Missing password')
        return
      }

      const passwordString = password.toString()

      if (passwordString.trim() === '') {
        setError('Password cannot be empty')
        return
      }

      try {
        await unlock(passwordString)
      } catch (e) {
        setError('Invalid master password. Try again.')
      } finally {
        setLoading(false)
      }
    },
    [unlock]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>You are currently locked out of the vault</CardTitle>
        <CardDescription>
          Enter the password you used to unlock the vault.
        </CardDescription>
      </CardHeader>
      <form action={setupAction}>
        <CardContent className="flex flex-col gap-4 mb-4">
          {error && <p className="text-destructive">{error}</p>}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Master password to access vault"
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <CardAction>
            <Button type="submit">{loading ? <Spinner /> : 'Unlock'}</Button>
          </CardAction>
        </CardFooter>
      </form>
    </Card>
  )
}
