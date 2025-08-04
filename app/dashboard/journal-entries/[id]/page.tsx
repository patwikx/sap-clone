import { notFound } from 'next/navigation'
import { getJournalEntryById } from '@/lib/actions/journal-entry'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface JournalEntryDetailPageProps {
  params: {
    id: string
  }
}

export default async function JournalEntryDetailPage({ params }: JournalEntryDetailPageProps) {
  const journalEntry = await getJournalEntryById(parseInt(params.id))

  if (!journalEntry) {
    notFound()
  }

  const totalDebits = journalEntry.lines.reduce((sum, line) => sum + line.debit, 0)
  const totalCredits = journalEntry.lines.reduce((sum, line) => sum + line.credit, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/journal-entries">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal Entries
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entry JE-{journalEntry.id}</h1>
          <p className="text-gray-600 mt-2">View journal entry details and line items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Journal Entry Lines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {journalEntry.lines.map((line) => (
                  <div key={line.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {line.account.acctCode} - {line.account.acctName}
                        </h4>
                        <Badge variant="outline" className="mt-1">
                          {line.account.acctType.charAt(0).toUpperCase() + line.account.acctType.slice(1)}
                        </Badge>
                        {line.shortName && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Reference:</strong> {line.shortName}
                          </p>
                        )}
                        {line.businessPartner && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Business Partner:</strong> {line.businessPartner.cardName}
                          </p>
                        )}
                        {line.lineMemo && (
                          <p className="text-sm text-gray-600 mt-1">
                            <strong>Memo:</strong> {line.lineMemo}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        {line.debit > 0 && (
                          <div className="text-green-600">
                            <p className="text-sm font-medium">Debit</p>
                            <p className="text-lg font-bold flex items-center justify-end">
                              <DollarSign className="h-4 w-4" />
                              {line.debit.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {line.credit > 0 && (
                          <div className="text-red-600">
                            <p className="text-sm font-medium">Credit</p>
                            <p className="text-lg font-bold flex items-center justify-end">
                              <DollarSign className="h-4 w-4" />
                              {line.credit.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entry Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Reference Date</p>
                  <p className="text-gray-600">{format(new Date(journalEntry.refDate), 'PPP')}</p>
                </div>
              </div>

              {journalEntry.dueDate && (
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p className="text-gray-600">{format(new Date(journalEntry.dueDate), 'PPP')}</p>
                  </div>
                </div>
              )}

              {journalEntry.taxDate && (
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Tax Date</p>
                    <p className="text-gray-600">{format(new Date(journalEntry.taxDate), 'PPP')}</p>
                  </div>
                </div>
              )}

              {journalEntry.memo && (
                <div>
                  <p className="font-medium text-sm">Memo</p>
                  <p className="text-gray-600 text-sm mt-1">{journalEntry.memo}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Totals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Debits:</span>
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {totalDebits.toFixed(2)}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Credits:</span>
                  <div className="flex items-center text-red-600 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {totalCredits.toFixed(2)}
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Balance:</span>
                    <div className={`flex items-center font-bold ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                      <DollarSign className="h-4 w-4" />
                      {Math.abs(totalDebits - totalCredits).toFixed(2)}
                      {Math.abs(totalDebits - totalCredits) < 0.01 ? ' ✓' : ' ⚠️'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}