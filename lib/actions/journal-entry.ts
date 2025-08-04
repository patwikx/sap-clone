'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface JournalEntryFormData {
  memo?: string
  refDate: Date
  dueDate?: Date
  taxDate?: Date
  lines: {
    accountId: string
    debit: number
    credit: number
    shortName?: string
    lineMemo?: string
    businessPartnerId?: string
  }[]
}

export async function getJournalEntries() {
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
            businessPartner: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return journalEntries
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return []
  }
}

export async function getJournalEntryById(id: number) {
  try {
    const journalEntry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
            businessPartner: true
          }
        }
      }
    })
    return journalEntry
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return null
  }
}

export async function createJournalEntry(data: JournalEntryFormData) {
  try {
    const journalEntry = await prisma.journalEntry.create({
      data: {
        memo: data.memo,
        refDate: data.refDate,
        dueDate: data.dueDate,
        taxDate: data.taxDate,
        lines: {
          create: data.lines.map(line => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            shortName: line.shortName,
            lineMemo: line.lineMemo,
            businessPartnerId: line.businessPartnerId
          }))
        }
      }
    })

    // Update account balances
    for (const line of data.lines) {
      const account = await prisma.account.findUnique({
        where: { id: line.accountId }
      })
      
      if (account) {
        let balanceChange = 0
        if (['asset', 'expense'].includes(account.acctType)) {
          balanceChange = line.debit - line.credit
        } else {
          balanceChange = line.credit - line.debit
        }

        await prisma.account.update({
          where: { id: line.accountId },
          data: {
            balance: {
              increment: balanceChange
            }
          }
        })
      }
    }

    revalidatePath('/dashboard/journal-entries')
    return { success: true, data: journalEntry }
  } catch (error) {
    console.error('Error creating journal entry:', error)
    return { success: false, error: 'Failed to create journal entry' }
  }
}

export async function deleteJournalEntry(id: number) {
  try {
    await prisma.journalEntry.delete({
      where: { id }
    })

    revalidatePath('/dashboard/journal-entries')
    return { success: true }
  } catch (error) {
    console.error('Error deleting journal entry:', error)
    return { success: false, error: 'Failed to delete journal entry' }
  }
}