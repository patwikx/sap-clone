import { notFound } from 'next/navigation'
import { getAccountById } from '@/lib/actions/chart-of-accounts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { AccountForm } from '../../components/chart-of-accounts-form'

interface EditAccountPageProps {
  params: {
    id: string
  }
}

export default async function EditAccountPage({ params }: EditAccountPageProps) {
  const account = await getAccountById(params.id)

  if (!account) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/chart-of-accounts/${account.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Account</h1>
          <p className="text-gray-600 mt-2">{account.acctName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountForm initialData={account} />
        </CardContent>
      </Card>
    </div>
  )
}