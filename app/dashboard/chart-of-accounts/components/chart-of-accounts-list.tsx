'use client'

import { useState } from 'react'
import { Account } from '@prisma/client'
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
  DollarSign,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteAccount } from '@/lib/actions/chart-of-accounts'

interface AccountsListProps {
  accounts: Account[]
}

export function AccountsList({ accounts }: AccountsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.acctName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.acctCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || account.acctType === typeFilter

    return matchesSearch && matchesType
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteAccount(id)
      if (result.success) {
        toast.success('Account deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete account ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'asset': return 'default'
      case 'liability': return 'destructive'
      case 'equity': return 'secondary'
      case 'revenue': return 'default'
      case 'expense': return 'outline'
      default: return 'default'
    }
  }

  const getBalanceColor = (balance: number, type: string) => {
    if (balance === 0) return 'text-gray-600'
    
    // Assets and Expenses are positive on debit side
    if (type === 'asset' || type === 'expense') {
      return balance > 0 ? 'text-green-600' : 'text-red-600'
    }
    // Liabilities, Equity, and Revenue are positive on credit side
    else {
      return balance < 0 ? 'text-green-600' : 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="asset">Assets</SelectItem>
            <SelectItem value="liability">Liabilities</SelectItem>
            <SelectItem value="equity">Equity</SelectItem>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{account.acctName}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{account.acctCode}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getTypeBadgeVariant(account.acctType)}>
                    {getTypeLabel(account.acctType)}
                  </Badge>
                  {account.isControlAccount && (
                    <Badge variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      Control
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/chart-of-accounts/${account.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/chart-of-accounts/${account.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(account.id, account.acctName)}
                        disabled={isDeleting === account.id}
                      >
                        {isDeleting === account.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Balance:</span>
                    <div className={`flex items-center text-lg font-semibold ${getBalanceColor(account.balance, account.acctType)}`}>
                      <DollarSign className="h-4 w-4" />
                      {Math.abs(account.balance).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Type:</span>
                    <span>{getTypeLabel(account.acctType)}</span>
                  </div>
                  {account.isControlAccount && (
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Control Account:</span>
                      <span>Yes</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No accounts found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}