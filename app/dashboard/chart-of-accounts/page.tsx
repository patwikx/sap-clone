
import { Button } from '@/components/ui/button'
import { getAccounts } from '@/lib/actions/chart-of-accounts'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { AccountsList } from './components/chart-of-accounts-list'

export default async function AccountsPage() {
  const accounts = await getAccounts()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-2">
            Manage your financial accounts and chart of accounts structure
          </p>
        </div>
        <Link href="/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </div>

      <AccountsList accounts={accounts} />
    </div>
  )
}