import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { JournalEntriesList } from './components/journal-entry-list'
import { getJournalEntries } from '@/lib/actions/journal-entry'
import { JournalEntryForm } from './components/journal-entry-form'

export default async function JournalEntriesPage() {
  const journalEntries = await getJournalEntries()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-2">
            Manage general ledger transactions and accounting entries
          </p>
        </div>
        <JournalEntryForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Journal Entry
          </Button>
        </JournalEntryForm>
      </div>

      <JournalEntriesList journalEntries={journalEntries} />
    </div>
  )
}