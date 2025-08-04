'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search, 
  Calendar,
  DollarSign,
  FileText,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { DocStatus } from '@prisma/client'
import { deleteARInvoice, getARInvoices, updateARInvoiceStatus } from '@/lib/actions/ar-invoice'

interface ARInvoicesListProps {
  arInvoices: Awaited<ReturnType<typeof getARInvoices>>
}

export function ARInvoicesList({ arInvoices }: ARInvoicesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const filteredInvoices = arInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.businessPartner.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.docNum.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || invoice.docStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (id: number, status: DocStatus) => {
    setIsUpdating(id)
    try {
      const result = await updateARInvoiceStatus(id, status)
      if (result.success) {
        toast.success('AR invoice status updated successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to update AR invoice status ${error}`)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: number, docNum: number) => {
    if (!confirm(`Are you sure you want to delete AR Invoice INV-${docNum}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteARInvoice(id)
      if (result.success) {
        toast.success('AR invoice deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete AR invoice ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: DocStatus) => {
    switch (status) {
      case 'O': return 'default'
      case 'C': return 'secondary'
      case 'L': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: DocStatus) => {
    switch (status) {
      case 'O': return 'Open'
      case 'C': return 'Closed'
      case 'L': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search AR invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="O">Open</SelectItem>
            <SelectItem value="C">Closed</SelectItem>
            <SelectItem value="L">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">INV-{invoice.docNum}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{invoice.businessPartner.cardName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(invoice.docStatus)}>
                    {getStatusLabel(invoice.docStatus)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/ar-invoices/${invoice.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {invoice.docStatus === 'O' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(invoice.id, 'C')}
                            disabled={isUpdating === invoice.id}
                          >
                            Close Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(invoice.id, 'L')}
                            disabled={isUpdating === invoice.id}
                          >
                            Cancel Invoice
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(invoice.id, invoice.docNum)}
                        disabled={isDeleting === invoice.id}
                      >
                        {isDeleting === invoice.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Invoice Date: {format(new Date(invoice.docDate), 'MMM dd, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Due Date: {format(new Date(invoice.docDueDate), 'MMM dd, yyyy')}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="mr-2 h-4 w-4" />
                  {invoice.lines.length} line item{invoice.lines.length !== 1 ? 's' : ''}
                </div>

                {invoice.baseDocType && invoice.baseDocNum && (
                  <div className="flex items-center text-sm text-gray-600">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Based on: {invoice.baseDocType} #{invoice.baseDocNum}
                  </div>
                )}

                {invoice.comments && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Comments:</p>
                    <p className="text-xs mt-1 p-2 bg-gray-50 rounded">{invoice.comments}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <div className="flex items-center text-lg font-semibold text-green-600">
                      <DollarSign className="h-4 w-4" />
                      {invoice.docTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {invoice.lines.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Invoice Lines:</p>
                    <div className="space-y-1">
                      {invoice.lines.slice(0, 3).map((line) => (
                        <div key={line.id} className="flex justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{line.description}</span>
                          <span className="flex-shrink-0">{line.quantity} × ${line.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {invoice.lines.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{invoice.lines.length - 3} more item{invoice.lines.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No AR invoices found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}