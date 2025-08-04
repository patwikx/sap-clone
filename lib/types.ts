import { Prisma } from '@prisma/client'

// Core entity types with relations
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
    serviceCalls: true
  }
}>

export type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    user: true
    manager: true
    subordinates: true
    businessUnit: true
  }
}>

export type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    employee: true
    businessUnit: true
    roles: {
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    }
  }
}>

export type ItemWithRelations = Prisma.ItemGetPayload<{
  include: {
    itemGroup: true
    uomGroup: {
      include: {
        uoms: true
      }
    }
    itemWarehouses: {
      include: {
        warehouse: true
      }
    }
    billOfMaterials: {
      include: {
        components: {
          include: {
            item: true
          }
        }
      }
    }
  }
}>

export type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: {
    businessPartner: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

export type PurchaseOrderWithRelations = Prisma.PurchaseOrderGetPayload<{
  include: {
    businessPartner: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

export type ARInvoiceWithRelations = Prisma.ARInvoiceGetPayload<{
  include: {
    businessPartner: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

export type APInvoiceWithRelations = Prisma.APInvoiceGetPayload<{
  include: {
    businessPartner: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>



export type JournalEntryWithRelations = Prisma.JournalEntryGetPayload<{
  include: {
    lines: {
      include: {
        account: true
        businessPartner: true
      }
    }
    businessUnit: true
  }
}>

export type HotelBookingWithRelations = Prisma.HotelBookingGetPayload<{
  include: {
    guest: true
    room: {
      include: {
        roomType: true
      }
    }
    ratePlan: true
    folio: {
      include: {
        transactions: true
      }
    }
    businessUnit: true
  }
}>

export type POSOrderWithRelations = Prisma.POSOrderGetPayload<{
  include: {
    customer: true
    terminal: true
    shift: true
    table: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
    payments: {
      include: {
        paymentMethod: true
      }
    }
    discounts: {
      include: {
        discount: true
      }
    }
  }
}>

export type PurchaseRequestWithRelations = Prisma.PurchaseRequestGetPayload<{
  include: {
    requester: true
    supplier: true
    businessUnit: true
    lines: {
      include: {
        item: true
      }
    }
  }
}>

// Form data types
export interface BusinessPartnerFormData {
  cardCode: string
  cardName: string
  cardType: 'C' | 'S' | 'L' | 'G'
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
  itemType: 'I' | 'S' | 'P' | 'H' | 'M'
  price: number
  avgCost?: number
  currency: string
  itemGroupId: string
  uomGroupId?: string
  procurementMethod: 'B' | 'M'
  leadTime: number
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
  businessUnitId: string
  userId?: string
}

export interface SalesOrderFormData {
  businessPartnerId: string
  businessUnitId: string
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

export interface PurchaseOrderFormData {
  businessPartnerId: string
  businessUnitId: string
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
  businessUnitId: string
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
  businessUnitId: string
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
  businessUnitId: string
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
  businessUnitId: string
  itemCode?: string
  serialNumber?: string
  priority: 'L' | 'M' | 'H'
  contractId?: string
}

export interface JournalEntryFormData {
  memo?: string
  businessUnitId: string
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

export interface HotelBookingFormData {
  guestId: string
  roomId: string
  ratePlanId: string
  businessUnitId: string
  checkInDate: Date
  checkOutDate: Date
  adults: number
  children: number
  specialRequests?: string
}

export interface POSOrderFormData {
  businessUnitId: string
  terminalId: string
  shiftId: string
  tableId?: string
  customerId?: string
  orderType: 'Dine-In' | 'Take-Out' | 'Delivery' | 'Room-Service'
  lines: {
    itemCode: string
    description: string
    quantity: number
    price: number
  }[]
  payments: {
    paymentMethodId: string
    amount: number
  }[]
  discounts?: {
    discountId: string
    amount: number
  }[]
}

export interface PurchaseRequestFormData {
  businessUnitId: string
  requesterId: string
  supplierId?: string
  requiredDate: Date
  comments?: string
  lines: {
    itemCode: string
    description: string
    quantity: number
  }[]
}

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

export interface AccountFormData {
  acctCode: string
  acctName: string
  acctType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  isControlAccount: boolean
}

// Warehouse types
export type WarehouseWithRelations = Prisma.WarehouseGetPayload<{
  include: {
    itemWarehouses: {
      include: {
        item: true
      }
    }
  }
}>

// Hotel specific types
export type HotelRoomWithRelations = Prisma.HotelRoomGetPayload<{
  include: {
    roomType: true
    businessUnit: true
    bookings: true
  }
}>

export type MenuWithRelations = Prisma.MenuGetPayload<{
  include: {
    categories: {
      include: {
        menuItems: {
          include: {
            item: true
          }
        }
      }
    }
    businessUnit: true
  }
}>

// Loyalty program types
export type LoyaltyProgramWithRelations = Prisma.LoyaltyProgramGetPayload<{
  include: {
    tiers: true
    members: {
      include: {
        guest: true
        tier: true
      }
    }
  }
}>

// Financial types
export type FiscalYearWithRelations = Prisma.FiscalYearGetPayload<{
  include: {
    periods: true
  }
}>

export type ExchangeRateWithRelations = Prisma.ExchangeRateGetPayload<{
  include: {
    fromCurrency: true
    toCurrency: true
  }
}>