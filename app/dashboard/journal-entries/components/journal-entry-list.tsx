'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { deleteJournalEntry, getJournalEntries } from '@/lib/actions/journal-entry'

interface JournalEntriesListProps {
  journalEntries: Awaited<ReturnType<typeof getJournalEntries>>
}

export function JournalEntriesList({ journalEntries }: JournalEntriesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const filteredEntries = journalEntries.filter(entry => {
    const searchLower = searchTerm.toLowerCase()
    return (
      entry.memo?.toLowerCase().includes(searchLower) ||
      entry.id.toString().includes(searchTerm) ||
      entry.lines.some(line => 
        line.account.acctName.toLowerCase().includes(searchLower) ||
        line.account.acctCode.toLowerCase().includes(searchLower) ||
        line.shortName?.toLowerCase().includes(searchLower)
      )
    )
  })

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete Journal Entry #${id}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteJournalEntry(id)
      if (result.success) {
        toast.success('Journal entry deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete journal entry: ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEntries.map((entry) => {
          const totalDebits = entry.lines.reduce((sum, line) => sum + line.debit, 0)
          const totalCredits = entry.lines.reduce((sum, line) => sum + line.credit, 0)

          return (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">JE-{entry.id}</CardTitle>
                    {entry.memo && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.memo}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/journal-entries/${entry.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting === entry.id}
                      >
                        {isDeleting === entry.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reference Date: {format(new Date(entry.refDate), 'MMM dd, yyyy')}
                  </div>

                  {entry.dueDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="mr-2 h-4 w-4" />
                      Due Date: {format(new Date(entry.dueDate), 'MMM dd, yyyy')}
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="mr-2 h-4 w-4" />
                    {entry.lines.length} line{entry.lines.length !== 1 ? 's' : ''}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Total Debits</p>
                        <div className="flex items-center justify-center text-sm font-semibold text-green-600">
                          <DollarSign className="h-3 w-3" />
                          {totalDebits.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Credits</p>
                        <div className="flex items-center justify-center text-sm font-semibold text-red-600">
                          <DollarSign className="h-3 w-3" />
                          {totalCredits.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {entry.lines.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Account Lines:</p>
                      <div className="space-y-1">
                        {entry.lines.slice(0, 3).map((line) => (
                          <div key={line.id} className="flex justify-between text-xs">
                            <span className="truncate flex-1 mr-2">
                              {line.account.acctCode} - {line.account.acctName}
                            </span>
                            <span className="flex-shrink-0">
                              {line.debit > 0 ? `Dr ${line.debit.toFixed(2)}` : `Cr ${line.credit.toFixed(2)}`}
                            </span>
                          </div>
                        ))}
                        {entry.lines.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{entry.lines.length - 3} more line{entry.lines.length - 3 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No journal entries found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}