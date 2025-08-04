'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const accountSchema = z.object({
  acctCode: z.string().min(1, 'Account code is required'),
  acctName: z.string().min(1, 'Account name is required'),
  acctType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  isControlAccount: z.boolean().default(false)
})

export type AccountFormData = z.infer<typeof accountSchema>

export async function createAccount(data: AccountFormData) {
  try {
    const validatedData = accountSchema.parse(data)
    
    const account = await prisma.account.create({
      data: validatedData
    })

    revalidatePath('/accounts')
    return { success: true, data: account }
  } catch (error) {
    console.error('Error creating account:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function getAccounts() {
  try {
    return await prisma.account.findMany({
      orderBy: {
        acctCode: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export async function getAccountById(id: string) {
  try {
    return await prisma.account.findUnique({
      where: { id },
      include: {
        journalEntryLines: {
          include: {
            journalEntry: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching account:', error)
    return null
  }
}

export async function updateAccount(id: string, data: AccountFormData) {
  try {
    const validatedData = accountSchema.parse(data)
    
    const account = await prisma.account.update({
      where: { id },
      data: validatedData
    })

    revalidatePath('/accounts')
    revalidatePath(`/accounts/${id}`)
    return { success: true, data: account }
  } catch (error) {
    console.error('Error updating account:', error)
    return { success: false, error: 'Failed to update account' }
  }
}

export async function deleteAccount(id: string) {
  try {
    await prisma.account.delete({
      where: { id }
    })

    revalidatePath('/accounts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, error: 'Failed to delete account' }
  }
}