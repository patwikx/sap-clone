'use server'

import { prisma } from '@/lib/prisma'
import { AccountFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getAccounts() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { acctCode: 'asc' }
    })
    return accounts
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return []
  }
}

export async function getAccountById(id: string) {
  try {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        journalEntryLines: {
          include: {
            journalEntry: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })
    return account
  } catch (error) {
    console.error('Error fetching account:', error)
    return null
  }
}

export async function createAccount(data: AccountFormData) {
  try {
    const account = await prisma.account.create({
      data: {
        acctCode: data.acctCode,
        acctName: data.acctName,
        acctType: data.acctType,
        isControlAccount: data.isControlAccount
      }
    })

    revalidatePath('/dashboard/chart-of-accounts')
    return { success: true, data: account }
  } catch (error) {
    console.error('Error creating account:', error)
    return { success: false, error: 'Failed to create account' }
  }
}

export async function updateAccount(id: string, data: AccountFormData) {
  try {
    const account = await prisma.account.update({
      where: { id },
      data: {
        acctCode: data.acctCode,
        acctName: data.acctName,
        acctType: data.acctType,
        isControlAccount: data.isControlAccount
      }
    })

    revalidatePath('/dashboard/chart-of-accounts')
    revalidatePath(`/dashboard/chart-of-accounts/${id}`)
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

    revalidatePath('/dashboard/chart-of-accounts')
    return { success: true }
  } catch (error) {
    console.error('Error deleting account:', error)
    return { success: false, error: 'Failed to delete account' }
  }
}