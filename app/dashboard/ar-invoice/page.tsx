
import { Button } from '@/components/ui/button'
import { getARInvoices } from '@/lib/actions/ar-invoice'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ARInvoicesList } from './components/ar-invoice-list'

export default async function ARInvoicesPage() {
  const arInvoices = await getARInvoices()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AR Invoices</h1>
          <p className="text-gray-600 mt-2">
            Manage customer invoices and accounts receivable
          </p>
        </div>
        <Link href="/ar-invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create AR Invoice
          </Button>
        </Link>
      </div>

      <ARInvoicesList arInvoices={arInvoices} />
    </div>
  )
}