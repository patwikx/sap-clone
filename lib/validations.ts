import { z } from 'zod'

export const accountSchema = z.object({
  acctCode: z.string().min(1, 'Account code is required'),
  acctName: z.string().min(1, 'Account name is required'),
  acctType: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense']),
  isControlAccount: z.boolean().default(false)
})

export const businessPartnerSchema = z.object({
  cardCode: z.string().min(1, 'Card code is required'),
  cardName: z.string().min(1, 'Card name is required'),
  cardType: z.enum(['C', 'S', 'L']),
  groupCode: z.number().min(1),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
  addresses: z.array(z.object({
    addressName: z.string().min(1),
    street: z.string().optional(),
    city: z.string().optional(),
    zipCode: z.string().optional(),
    state: z.string().optional(),
    country: z.string().min(1),
    addressType: z.enum(['bo_BillTo', 'bo_ShipTo'])
  }))
})

export const itemSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  itemName: z.string().min(1, 'Item name is required'),
  itemType: z.enum(['I', 'S', 'P']),
  price: z.number().min(0),
  currency: z.string().min(1),
  itemGroupId: z.string().min(1),
  procurementMethod: z.enum(['B', 'M']),
  leadTime: z.number().min(1)
})

export const employeeSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  managerId: z.string().optional(),
  officePhone: z.string().optional(),
  mobilePhone: z.string().optional(),
  email: z.string().email('Valid email is required'),
  userId: z.string().optional()
})

export const salesOrderSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, 'At least one line item is required')
})
export const purchaseOrderSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, 'At least one line item is required')
})

export const arInvoiceSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  baseDocType: z.string().optional(),
  baseDocNum: z.number().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    baseDocType: z.string().optional(),
    baseDocNum: z.number().optional(),
    baseLineNum: z.number().optional()
  })).min(1, 'At least one line item is required')
})

export const apInvoiceSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  baseDocType: z.string().optional(),
  baseDocNum: z.number().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    baseDocType: z.string().optional(),
    baseDocNum: z.number().optional(),
    baseLineNum: z.number().optional()
  })).min(1, 'At least one line item is required')
})

export const productionOrderSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  type: z.enum(['S', 'P', 'D']).default('S'),
  plannedQty: z.number().min(1, 'Planned quantity must be greater than 0'),
  postingDate: z.date(),
  dueDate: z.date(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    baseQty: z.number().min(0),
    plannedQty: z.number().min(0)
  })).optional()
})

export const serviceCallSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  customerId: z.string().min(1, 'Customer is required'),
  itemCode: z.string().optional(),
  serialNumber: z.string().optional(),
  priority: z.enum(['L', 'M', 'H']).default('M'),
  contractId: z.string().optional()
})
