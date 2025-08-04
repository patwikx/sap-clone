import { Prisma } from '@prisma/client'

// Account types
export type AccountWithRelations = Prisma.AccountGetPayload<{
  include: {
    journalEntryLines: {
      include: {
        journalEntry: true
      }
    }
  }
}>

// Business Partner types
export type BusinessPartnerWithAddresses = Prisma.BusinessPartnerGetPayload<{
  include: { addresses: true }
}>

export type BusinessPartnerWithRelations = Prisma.BusinessPartnerGetPayload<{
  include: {
    addresses: true
    salesOrders: true
    purchaseOrders: true
    arInvoices: true
    apInvoices: true
  }
}>

// Employee types
export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    manager: true
    subordinates: true
  }
}>

// Item types
export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    itemGroup: true
    itemWarehouses: {
      include: {
        warehouse: true
      }
    }
  }
}>

// Sales Order types
export type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    businessPartner: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

// Purchase Order types
export type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
  include: {
    businessPartner: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>


// AR Invoice types
export type ARInvoiceWithRelations = Prisma.ARInvoiceGetPayload<{
  include: {
    businessPartner: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

// AP Invoice types
export type APInvoiceWithRelations = Prisma.APInvoiceGetPayload<{
  include: {
    businessPartner: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

// Production Order types
export type ProductionOrderWithRelations = Prisma.ProductionOrderGetPayload<{
  include: {
    item: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

// Service Call types
export type ServiceCallWithRelations = Prisma.ServiceCallGetPayload<{
  include: {
    customer: true
    equipmentCard: {
      include: {
        item: true
      }
    }
    contract: true
  }
}>

// Form types for accounts
export interface AccountFormData {
  acctCode: string
  acctName: string
  acctType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  isControlAccount: boolean
}

export interface PurchaseOrderFormData {
  businessPartnerId: string
  docDate: Date
  docDueDate: Date
  taxDate: Date
  comments?: string
  lines: {
    itemCode: string
    description: string
    quantity: number
    price: number
  }[]
}

export interface ARInvoiceFormData {
  businessPartnerId: string
  docDate: Date
  docDueDate: Date
  taxDate: Date
  comments?: string
  baseDocType?: string
  baseDocNum?: number
  lines: {
    itemCode: string
    description: string
    quantity: number
    price: number
    baseDocType?: string
    baseDocNum?: number
    baseLineNum?: number
  }[]
}

export interface APInvoiceFormData {
  businessPartnerId: string
  docDate: Date
  docDueDate: Date
  taxDate: Date
  comments?: string
  baseDocType?: string
  baseDocNum?: number
  lines: {
    itemCode: string
    description: string
    quantity: number
    price: number
    baseDocType?: string
    baseDocNum?: number
    baseLineNum?: number
  }[]
}

export interface ProductionOrderFormData {
  itemId: string
  type: 'S' | 'P' | 'D'
  plannedQty: number
  postingDate: Date
  dueDate: Date
  lines?: {
    itemCode: string
    baseQty: number
    plannedQty: number
  }[]
}

export interface ServiceCallFormData {
  subject: string
  customerId: string
  itemCode?: string
  serialNumber?: string
  priority: 'L' | 'M' | 'H'
  contractId?: string
}

// Form types
export interface BusinessPartnerFormData {
  cardCode: string
  cardName: string
  cardType: 'C' | 'S' | 'L'
  groupCode: number
  phone1?: string
  phone2?: string
  email?: string
  website?: string
  notes?: string
  addresses: {
    addressName: string
    street?: string
    city?: string
    zipCode?: string
    state?: string
    country: string
    addressType: 'bo_BillTo' | 'bo_ShipTo'
  }[]
}

export interface ItemFormData {
  itemCode: string
  itemName: string
  itemType: 'I' | 'S' | 'P'
  price: number
  currency: string
  itemGroupId: string
  procurementMethod: 'B' | 'M'
  leadTime: number
}

export interface SalesOrderFormData {
  businessPartnerId: string
  docDate: Date
  docDueDate: Date
  taxDate: Date
  comments?: string
  lines: {
    itemCode: string
    description: string
    quantity: number
    price: number
  }[]
}

export interface EmployeeFormData {
  firstName: string
  lastName: string
  jobTitle?: string
  department?: string
  managerId?: string
  officePhone?: string
  mobilePhone?: string
  email: string
  userId?: string
}