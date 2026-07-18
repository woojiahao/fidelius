import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useCallback, useState } from 'react'

export default function SetupPage() {
  const { setup } = useAuth()
  const [error, setError] = useState<string>()

  const setupAction = useCallback(
    (form: FormData) => {
      const clientId = form.get('client-id')
      const clientSecret = form.get('client-secret')
      const password = form.get('password')
      setError(undefined)

      if (clientId == null || clientSecret == null || password == null) {
        setError('Missing client ID or client secret or password')
        return
      }

      if (
        clientId.toString().trim() === '' ||
        clientSecret.toString().trim() === '' ||
        password.toString().trim() === ''
      ) {
        setError('Client ID or client secret or password cannot be empty')
        return
      }

      setup(password.toString(), {
        clientId: clientId.toString(),
        clientSecret: clientSecret.toString(),
      })
    },
    [setup]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter your BitWarden credentials</CardTitle>
        <CardDescription>
          These are stored securely on your local machine.
        </CardDescription>
      </CardHeader>
      <form action={setupAction}>
        <CardContent className="flex flex-col gap-4">
          {error && <p className="text-red-600">{error}</p>}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="client-id">Client ID</FieldLabel>
              <Input
                id="client-id"
                name="client-id"
                placeholder="Client ID"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="client-secret">Client Secret</FieldLabel>
              <Input
                id="client-secret"
                name="client-secret"
                placeholder="Client secret"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Local password to access vault"
                required
              />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <CardAction>
            <Button type="submit">Setup</Button>
          </CardAction>
        </CardFooter>
      </form>
    </Card>
  )
}
