import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function LoadingPage() {
  return (
    <Card>
      <CardTitle>Loading fidelius...</CardTitle>
      <CardContent>
        <Spinner />
      </CardContent>
    </Card>
  )
}
