
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { APInvoicesList } from './components/ap-invoice-list'
import { getAPInvoices } from '@/lib/actions/ap-invoice'
import { APInvoiceForm } from './components/ap-invoice-form'

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
        <APInvoiceForm>
          <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create AP Invoice
          </Button>
        </APInvoiceForm>
      </div>

      <APInvoicesList apInvoices={apInvoices} />
    </div>
  )
}