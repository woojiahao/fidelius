import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function LoadingPage() {
  return (
    <Card className="flex text-center">
      <CardTitle>Loading fidelius...</CardTitle>
      <CardContent className="flex self-center">
        <Spinner />
      </CardContent>
    </Card>
  )
}
