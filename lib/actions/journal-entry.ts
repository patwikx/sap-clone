'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const journalEntrySchema = z.object({
  memo: z.string().optional(),
  refDate: z.date(),
  dueDate: z.date().optional(),
  taxDate: z.date().optional(),
  lines: z.array(z.object({
    accountId: z.string().min(1, 'Account is required'),
    debit: z.number().min(0),
    credit: z.number().min(0),
    shortName: z.string().optional(),
    lineMemo: z.string().optional(),
    businessPartnerId: z.string().optional()
  })).min(2, 'At least two lines are required')
}).refine((data) => {
  // Validate that debits equal credits
  const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0)
  const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0)
  return Math.abs(totalDebits - totalCredits) < 0.01
}, {
  message: 'Total debits must equal total credits'
}).refine((data) => {
  // Validate that each line has either debit or credit (not both)
  return data.lines.every(line => 
    (line.debit > 0 && line.credit === 0) || (line.credit > 0 && line.debit === 0)
  )
}, {
  message: 'Each line must have either debit or credit, not both'
})

export type JournalEntryFormData = z.infer<typeof journalEntrySchema>

export type JournalEntryWithRelations = Awaited<ReturnType<typeof getJournalEntryById>>

export async function createJournalEntry(data: JournalEntryFormData) {
  try {
    const validatedData = journalEntrySchema.parse(data)
    
    const journalEntry = await prisma.journalEntry.create({
      data: {
        memo: validatedData.memo,
        refDate: validatedData.refDate,
        dueDate: validatedData.dueDate,
        taxDate: validatedData.taxDate,
        lines: {
          create: validatedData.lines.map((line, index) => ({
            line_id: index + 1,
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            shortName: line.shortName,
            lineMemo: line.lineMemo,
            businessPartnerId: line.businessPartnerId
          }))
        }
      },
      include: {
        lines: {
          include: {
            account: true,
            businessPartner: true
          }
        }
      }
    })

    // Update account balances
    for (const line of validatedData.lines) {
      const account = await prisma.account.findUnique({
        where: { id: line.accountId }
      })
      
      if (account) {
        let balanceChange = 0
        
        // For assets and expenses, debits increase balance
        if (account.acctType === 'asset' || account.acctType === 'expense') {
          balanceChange = line.debit - line.credit
        } else {
          // For liabilities, equity, and revenue, credits increase balance
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
    if (error instanceof z.ZodError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create journal entry' }
  }
}

export async function getJournalEntries() {
  try {
    return await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
            businessPartner: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching journal entries:', error)
    return []
  }
}

export async function getJournalEntryById(id: number) {
  try {
    return await prisma.journalEntry.findUnique({
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
  } catch (error) {
    console.error('Error fetching journal entry:', error)
    return null
  }
}

export async function deleteJournalEntry(id: number) {
  try {
    // Get the journal entry with lines first
    const journalEntry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    })

    if (!journalEntry) {
      return { success: false, error: 'Journal entry not found' }
    }

    // Reverse the account balance changes
    for (const line of journalEntry.lines) {
      let balanceChange = 0
      
      // Reverse the original balance change
      if (line.account.acctType === 'asset' || line.account.acctType === 'expense') {
        balanceChange = line.credit - line.debit // Opposite of original
      } else {
        balanceChange = line.debit - line.credit // Opposite of original
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

    // Delete the journal entry (lines will be deleted due to cascade)
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