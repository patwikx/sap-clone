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
  cardType: z.enum(['C', 'S', 'L', 'G']),
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
  itemType: z.enum(['I', 'S', 'P', 'H', 'M']),
  price: z.number().min(0),
  avgCost: z.number().min(0).optional(),
  currency: z.string().min(1),
  itemGroupId: z.string().min(1),
  uomGroupId: z.string().optional(),
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
  businessUnitId: z.string().min(1, 'Business unit is required'),
  userId: z.string().optional()
})

export const salesOrderSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  priority: z.enum(['L', 'M', 'H']),
  itemCode: z.string().optional(),
  serialNumber: z.string().optional(),
  contractId: z.string().optional()
})

export const journalEntrySchema = z.object({
  memo: z.string().optional(),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
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
  const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0)
  const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0)
  return Math.abs(totalDebits - totalCredits) < 0.01
}, {
  message: 'Total debits must equal total credits'
})

export const hotelBookingSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  roomId: z.string().min(1, 'Room is required'),
  ratePlanId: z.string().min(1, 'Rate plan is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  checkInDate: z.date(),
  checkOutDate: z.date(),
  adults: z.number().min(1),
  children: z.number().min(0),
  specialRequests: z.string().optional()
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out date must be after check-in date'
})

export const posOrderSchema = z.object({
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  terminalId: z.string().min(1, 'Terminal is required'),
  shiftId: z.string().min(1, 'Shift is required'),
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  orderType: z.enum(['Dine-In', 'Take-Out', 'Delivery', 'Room-Service']),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, 'At least one line item is required'),
  payments: z.array(z.object({
    paymentMethodId: z.string().min(1),
    amount: z.number().min(0)
  })).min(1, 'At least one payment is required'),
  discounts: z.array(z.object({
    discountId: z.string().min(1),
    amount: z.number().min(0)
  })).optional()
})

export const purchaseRequestSchema = z.object({
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  requesterId: z.string().min(1, 'Requester is required'),
  supplierId: z.string().optional(),
  requiredDate: z.date(),
  comments: z.string().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1)
  })).min(1, 'At least one line item is required')
})

export const hotelRoomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  status: z.enum(['Available', 'Occupied', 'OutOfOrder']).default('Available'),
  housekeepingStatus: z.enum(['Clean', 'Dirty', 'Inspect']).default('Clean')
})

export const menuSchema = z.object({
  name: z.string().min(1, 'Menu name is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  isActive: z.boolean().default(true)
})

export const loyaltyProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  pointsRatio: z.number().min(0, 'Points ratio must be positive'),
  isActive: z.boolean().default(true)
})

export const fiscalYearSchema = z.object({
  name: z.string().min(1, 'Fiscal year name is required'),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(['Open', 'Closed']).default('Open')
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date'
})

export const currencySchema = z.object({
  code: z.string().min(3, 'Currency code must be 3 characters').max(3),
  name: z.string().min(1, 'Currency name is required'),
  symbol: z.string().min(1, 'Currency symbol is required'),
  isBase: z.boolean().default(false)
})

export const taxGroupSchema = z.object({
  code: z.string().min(1, 'Tax group code is required'),
  name: z.string().min(1, 'Tax group name is required')
})

export const businessUnitSchema = z.object({
  name: z.string().min(1, 'Business unit name is required'),
  code: z.string().min(1, 'Business unit code is required')
})

export const warehouseSchema = z.object({
  whsCode: z.string().min(1, 'Warehouse code is required'),
  whsName: z.string().min(1, 'Warehouse name is required')
})

export const itemGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required')
})

export const uomGroupSchema = z.object({
  name: z.string().min(1, 'UOM group name is required')
})

export const uomSchema = z.object({
  name: z.string().min(1, 'UOM name is required'),
  code: z.string().min(1, 'UOM code is required'),
  baseUoM: z.string().min(1, 'Base UOM is required'),
  conversionFactor: z.number().min(0, 'Conversion factor must be positive'),
  uomGroupId: z.string().min(1, 'UOM group is required')
})

export const roleSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional()
})

export const permissionSchema = z.object({
  module: z.string().min(1, 'Module is required'),
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required')
})

export const hotelRoomTypeSchema = z.object({
  name: z.string().min(1, 'Room type name is required'),
  description: z.string().optional(),
  baseRate: z.number().min(0, 'Base rate must be positive'),
  itemId: z.string().min(1, 'Item is required')
})

export const ratePlanSchema = z.object({
  name: z.string().min(1, 'Rate plan name is required'),
  roomTypeId: z.string().min(1, 'Room type is required'),
  startDate: z.date(),
  endDate: z.date(),
  rate: z.number().min(0, 'Rate must be positive')
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date'
})

export const paymentMethodSchema = z.object({
  name: z.string().min(1, 'Payment method name is required')
})

export const discountSchema = z.object({
  name: z.string().min(1, 'Discount name is required'),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().min(0, 'Discount value must be positive')
})

export const posTerminalSchema = z.object({
  name: z.string().min(1, 'Terminal name is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required')
})

export const restaurantTableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  businessUnitId: z.string().min(1, 'Business Unit is required'),
  status: z.enum(['Available', 'Occupied', 'Reserved']).default('Available')
})

export const equipmentCardSchema = z.object({
  itemCode: z.string().min(1, 'Item code is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  customerId: z.string().min(1, 'Customer is required'),
  warrantyStartDate: z.date().optional(),
  warrantyEndDate: z.date().optional()
})

export const serviceContractSchema = z.object({
  contractName: z.string().min(1, 'Contract name is required'),
  customerId: z.string().min(1, 'Customer is required'),
  startDate: z.date(),
  endDate: z.date(),
  contractValue: z.number().min(0, 'Contract value must be positive')
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date'
})

export const billOfMaterialsSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  version: z.string().min(1, 'Version is required'),
  isActive: z.boolean().default(true),
  components: z.array(z.object({
    itemId: z.string().min(1, 'Component item is required'),
    quantity: z.number().min(0, 'Quantity must be positive')
  })).min(1, 'At least one component is required')
})

export const housekeepingTaskSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  taskType: z.enum(['CLEANING', 'MAINTENANCE', 'INSPECTION']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  estimatedTime: z.number().min(1, 'Estimated time must be positive'),
  assignedToId: z.string().optional(),
  notes: z.string().optional()
})