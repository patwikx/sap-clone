
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { APInvoicesList } from './components/ap-invoice-list'
import { getAPInvoices } from '@/lib/actions/ap-invoice'

export default async function APInvoicesPage() {
  const apInvoices = await getAPInvoices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AP Invoices</h1>
          <p className="text-gray-600 mt-2">
            Manage supplier invoices and accounts payable
          </p>
        </div>
        <Link href="/ap-invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create AP Invoice
          </Button>
        </Link>
      </div>

      <APInvoicesList apInvoices={apInvoices} />
    </div>
  )
}