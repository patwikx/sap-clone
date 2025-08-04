'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface JournalEntryFormData {
  number: string
  date: Date
  reference?: string
  description: string
  periodId: string
  lines: {
    accountId: string
    debitAmount: number
    creditAmount: number
    description?: string
    costCenterId?: string
  }[]
}

export async function getJournalEntries() {
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        },
        period: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return journalEntries
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return []
  }
}

export async function getJournalEntryById(id: string) {
  try {
    const journalEntry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        },
        period: true
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
    // Calculate totals
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debitAmount, 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + line.creditAmount, 0)

    const journalEntry = await prisma.journalEntry.create({
      data: {
        number: data.number,
        date: data.date,
        reference: data.reference,
        description: data.description,
        totalDebit: new Decimal(totalDebit),
        totalCredit: new Decimal(totalCredit),
        periodId: data.periodId,
        lines: {
          create: data.lines.map(line => ({
            accountId: line.accountId,
            debitAmount: new Decimal(line.debitAmount),
            creditAmount: new Decimal(line.creditAmount),
            description: line.description,
            costCenterId: line.costCenterId
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
        if (['ASSET', 'EXPENSE'].includes(account.type.toUpperCase())) {
          balanceChange = line.debitAmount - line.creditAmount
        } else {
          balanceChange = line.creditAmount - line.debitAmount
        }

        await prisma.account.update({
          where: { id: line.accountId },
          data: {
            balance: {
              increment: new Decimal(balanceChange)
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

export async function deleteJournalEntry(id: string) {
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