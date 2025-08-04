'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface PaymentMethodFormData {
  name: string
  type: string
}

export async function getPaymentMethods() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' }
    })
    return paymentMethods
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

export async function getPaymentMethodById(id: string) {
  try {
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id }
    })
    return paymentMethod
  } catch (error) {
    console.error('Error fetching payment method:', error)
    return null
  }
}

export async function createPaymentMethod(data: PaymentMethodFormData) {
  try {
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name: data.name,
        type: data.type
      }
    })

    revalidatePath('/dashboard/settings/payment-methods')
    return { success: true, data: paymentMethod }
  } catch (error) {
    console.error('Error creating payment method:', error)
    return { success: false, error: 'Failed to create payment method' }
  }
}

export async function updatePaymentMethod(id: string, data: PaymentMethodFormData) {
  try {
    const paymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type
      }
    })

    revalidatePath('/dashboard/settings/payment-methods')
    revalidatePath(`/dashboard/settings/payment-methods/${id}`)
    return { success: true, data: paymentMethod }
  } catch (error) {
    console.error('Error updating payment method:', error)
    return { success: false, error: 'Failed to update payment method' }
  }
}

export async function deletePaymentMethod(id: string) {
  try {
    await prisma.paymentMethod.delete({
      where: { id }
    })

    revalidatePath('/dashboard/settings/payment-methods')
    return { success: true }
  } catch (error) {
    console.error('Error deleting payment method:', error)
    return { success: false, error: 'Failed to delete payment method' }
  }
}

export async function getActivePaymentMethods() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' }
    })
    return paymentMethods
  } catch (error) {
    console.error('Error fetching active payment methods:', error)
    return []
  }
} 