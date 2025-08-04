'use server'

import { prisma } from '@/lib/prisma'
import { businessPartnerSchema } from '@/lib/validations'
import { BusinessPartnerFormData, BusinessPartnerWithAddresses } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createBusinessPartner(data: BusinessPartnerFormData) {
  try {
    const validatedData = businessPartnerSchema.parse(data)
    
    const businessPartner = await prisma.businessPartner.create({
      data: {
        cardCode: validatedData.cardCode,
        cardName: validatedData.cardName,
        cardType: validatedData.cardType,
        groupCode: validatedData.groupCode,
        phone1: validatedData.phone1,
        phone2: validatedData.phone2,
        email: validatedData.email,
        website: validatedData.website,
        notes: validatedData.notes,
        addresses: {
          create: validatedData.addresses
        }
      },
      include: {
        addresses: true
      }
    })

    revalidatePath('/business-partners')
    return { success: true, data: businessPartner }
  } catch (error) {
    console.error('Error creating business partner:', error)
    return { success: false, error: 'Failed to create business partner' }
  }
}

export async function getBusinessPartners(): Promise<BusinessPartnerWithAddresses[]> {
  try {
    return await prisma.businessPartner.findMany({
      include: {
        addresses: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching business partners:', error)
    return []
  }
}

export async function getBusinessPartnerById(id: string): Promise<BusinessPartnerWithAddresses | null> {
  try {
    return await prisma.businessPartner.findUnique({
      where: { id },
      include: {
        addresses: true
      }
    })
  } catch (error) {
    console.error('Error fetching business partner:', error)
    return null
  }
}

export async function updateBusinessPartner(id: string, data: BusinessPartnerFormData) {
  try {
    const validatedData = businessPartnerSchema.parse(data)
    
    const businessPartner = await prisma.businessPartner.update({
      where: { id },
      data: {
        cardCode: validatedData.cardCode,
        cardName: validatedData.cardName,
        cardType: validatedData.cardType,
        groupCode: validatedData.groupCode,
        phone1: validatedData.phone1,
        phone2: validatedData.phone2,
        email: validatedData.email,
        website: validatedData.website,
        notes: validatedData.notes,
        addresses: {
          deleteMany: {},
          create: validatedData.addresses
        }
      },
      include: {
        addresses: true
      }
    })

    revalidatePath('/business-partners')
    revalidatePath(`/business-partners/${id}`)
    return { success: true, data: businessPartner }
  } catch (error) {
    console.error('Error updating business partner:', error)
    return { success: false, error: 'Failed to update business partner' }
  }
}

export async function deleteBusinessPartner(id: string) {
  try {
    await prisma.businessPartner.delete({
      where: { id }
    })

    revalidatePath('/business-partners')
    return { success: true }
  } catch (error) {
    console.error('Error deleting business partner:', error)
    return { success: false, error: 'Failed to delete business partner' }
  }
}