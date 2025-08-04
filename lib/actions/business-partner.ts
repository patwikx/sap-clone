'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { PartnerType } from '@prisma/client'

interface BusinessPartnerFormData {
  code: string
  name: string
  type: PartnerType
  groupCode?: string
  phone?: string
  email?: string
  addresses?: {
    name: string
    street?: string
    city?: string
    zipCode?: string
    country: string
    type: string
    isDefault: boolean
  }[]
}

export async function getBusinessPartners() {
  try {
    const businessPartners = await prisma.businessPartner.findMany({
      include: {
        addresses: true,
        customerPaymentTerms: true,
        supplierPaymentTerms: true
      },
      orderBy: { name: 'asc' }
    })
    return businessPartners
  } catch (error) {
    console.error('Error fetching business partners:', error)
    return []
  }
}

export async function getBusinessPartnerById(id: string) {
  try {
    const businessPartner = await prisma.businessPartner.findUnique({
      where: { id },
      include: {
        addresses: true,
        customerPaymentTerms: true,
        supplierPaymentTerms: true
      }
    })
    return businessPartner
  } catch (error) {
    console.error('Error fetching business partner:', error)
    return null
  }
}

export async function createBusinessPartner(data: BusinessPartnerFormData) {
  try {
    const businessPartner = await prisma.businessPartner.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        groupCode: data.groupCode,
        phone: data.phone,
        email: data.email,
        addresses: data.addresses ? {
          create: data.addresses.map(addr => ({
            name: addr.name,
            street: addr.street,
            city: addr.city,
            zipCode: addr.zipCode,
            country: addr.country,
            type: addr.type,
            isDefault: addr.isDefault
          }))
        } : undefined
      }
    })

    revalidatePath('/dashboard/business-partners')
    return { success: true, data: businessPartner }
  } catch (error) {
    console.error('Error creating business partner:', error)
    return { success: false, error: 'Failed to create business partner' }
  }
}

export async function updateBusinessPartner(id: string, data: Partial<BusinessPartnerFormData>) {
  try {
    const { addresses, ...updateData } = data

    const businessPartner = await prisma.businessPartner.update({
      where: { id },
      data: updateData
    })

    // Update addresses if provided
    if (data.addresses) {
      // Delete existing addresses
      await prisma.businessPartnerAddress.deleteMany({
        where: { businessPartnerId: id }
      })

      // Create new addresses
      await prisma.businessPartnerAddress.createMany({
        data: data.addresses.map(addr => ({
          businessPartnerId: id,
          name: addr.name,
          street: addr.street,
          city: addr.city,
          zipCode: addr.zipCode,
          country: addr.country,
          type: addr.type,
          isDefault: addr.isDefault
        }))
      })
    }

    revalidatePath('/dashboard/business-partners')
    revalidatePath(`/dashboard/business-partners/${id}`)
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

    revalidatePath('/dashboard/business-partners')
    return { success: true }
  } catch (error) {
    console.error('Error deleting business partner:', error)
    return { success: false, error: 'Failed to delete business partner' }
  }
}

export async function getCustomers() {
  try {
    const customers = await prisma.businessPartner.findMany({
      where: { type: 'CUSTOMER' },
      include: {
        addresses: true,
        customerPaymentTerms: true
      },
      orderBy: { name: 'asc' }
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return []
  }
}

export async function getSuppliers() {
  try {
    const suppliers = await prisma.businessPartner.findMany({
      where: { type: 'SUPPLIER' },
      include: {
        addresses: true,
        supplierPaymentTerms: true
      },
      orderBy: { name: 'asc' }
    })
    return suppliers
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }
} 