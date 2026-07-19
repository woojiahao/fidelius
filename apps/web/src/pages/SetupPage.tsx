import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useCallback, useState } from 'react'

interface SetupPageProps {
  message?: string
}

export default function SetupPage({ message }: SetupPageProps) {
  const { setup } = useAuth()
  const [error, setError] = useState<string>()

  const setupAction = useCallback(
    (form: FormData) => {
      const serverUrl = form.get('server-url')
      setError(undefined)

      if (serverUrl == null) {
        setError('Missing server url')
        return
      }

      const serverUrlString = serverUrl.toString()

      if (serverUrlString.trim() === '') {
        setError('Server url cannot be empty')
        return
      }

      setup({ serverUrl: serverUrlString })
    },
    [setup]
  )

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4">
        {message && (
          <Alert variant="destructive">
            <AlertTitle>Setup your Bitwarden server configuration</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        <div>
          <CardTitle>Enter your Bitwarden server configuration</CardTitle>
          <CardDescription>
            These are stored securely on your local machine.
          </CardDescription>
        </div>
      </CardHeader>
      <form action={setupAction}>
        <CardContent className="flex flex-col gap-4">
          {error && <p className="text-red-600">{error}</p>}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="server-url">
                Server Url<span className="text-red-600">*</span>
              </FieldLabel>
              <FieldDescription>
                Server url started when you run <code>bw serve</code>
              </FieldDescription>
              <Input
                id="server-url"
                name="server-url"
                placeholder="http://localhost:8087"
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
