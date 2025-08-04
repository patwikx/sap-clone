import { PrismaClient, RoomStatus, HousekeepingStatus } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Clear existing data (optional - uncomment if needed)
  // await clearDatabase()

  // 1. Create Business Units
  console.log("📍 Creating business units...")
  const businessUnits = await createBusinessUnits()

  // 2. Create Users and Employees
  console.log("👥 Creating users and employees...")
  const { users, employees } = await createUsersAndEmployees(businessUnits)

  // 3. Create RBAC (Roles, Permissions, etc.)
  console.log("🔐 Setting up RBAC...")
  await createRBAC(users)

  // 4. Create Business Partners
  console.log("🤝 Creating business partners...")
  const businessPartners = await createBusinessPartners()

  // 5. Create Accounting Structure
  console.log("💰 Setting up accounting...")
  const accounts = await createAccountingStructure()

  // 6. Create Inventory Structure
  console.log("📦 Setting up inventory...")
  const { itemGroups, items, warehouses } = await createInventoryStructure(businessUnits)

  // 7. Create Hotel Structure
  console.log("🏨 Setting up hotel management...")
  const hotelData = await createHotelStructure(businessUnits)

  // 8. Create POS Structure
  console.log("🛒 Setting up POS system...")
  const posData = await createPOSStructure(businessUnits, items)

  // 9. Create Sample Transactions
  console.log("📊 Creating sample transactions...")
  await createSampleTransactions(businessUnits, businessPartners, items, employees, hotelData, posData)

  console.log("✅ Database seeding completed successfully!")
}

async function clearDatabase() {
  console.log("🧹 Clearing existing data...")

  // Delete in reverse dependency order
  const tableNames = [
    "audit_logs",
    "notifications",
    "approval_requests",
    "approval_stages",
    "user_roles",
    "role_permissions",
    "permissions",
    "roles",
    "pos_return_lines",
    "pos_returns",
    "pos_split_payments",
    "pos_order_splits",
    "pos_payments",
    "pos_voids",
    "service_charges",
    "pos_order_modifications",
    "kot_items",
    "kitchen_order_tickets",
    "pos_order_lines",
    "pos_orders",
    "cash_transactions",
    "cash_drawers",
    "pos_shifts",
    "pos_terminals",
    "gift_card_transactions",
    "gift_cards",
    "promotions",
    "ar_invoice_lines",
    "ar_invoices",
    "ap_invoice_lines",
    "ap_invoices",
    "goods_receipt_lines",
    "goods_receipts",
    "stock_transfer_lines",
    "stock_transfers",
    "purchase_order_lines",
    "purchase_orders",
    "purchase_request_lines",
    "purchase_requests",
    "inventory_valuations",
    "item_expiries",
    "waste_tracking",
    "recipe_ingredients",
    "recipes",
    "serial_numbers",
    "batch_numbers",
    "inventory_counts",
    "stock_transactions",
    "auto_reorder_suggestions",
    "item_reorder_points",
    "item_warehouses",
    "hotel_bookings",
    "guest_requests",
    "booking_deposits",
    "folios",
    "housekeeping_checklist",
    "housekeeping_tasks",
    "housekeeping_logs",
    "room_inventories",
    "hotel_rooms",
    "rate_plans",
    "hotel_room_types",
    "items",
    "item_groups",
    "warehouses",
    "business_partner_addresses",
    "business_partners",
    "bank_statement_lines",
    "bank_statements",
    "bank_accounts",
    "journal_entry_lines",
    "journal_entries",
    "financial_periods",
    "fiscal_years",
    "cost_centers",
    "tax_codes",
    "tax_groups",
    "payment_terms",
    "accounts",
    "employees",
    "users",
    "business_units",
  ]

  for (const tableName of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM "${tableName}"`)
    } catch (error) {
      console.log(`⚠️  Could not clear ${tableName}:`, error)
    }
  }
}

async function createBusinessUnits() {
  const units = [
    { name: "Grand Hotel Downtown", code: "GHD" },
    { name: "Seaside Resort & Spa", code: "SRS" },
    { name: "Mountain View Lodge", code: "MVL" },
    { name: "City Center Restaurant", code: "CCR" },
  ]

  const businessUnits = []
  for (const unit of units) {
    const businessUnit = await prisma.businessUnit.create({
      data: unit,
    })
    businessUnits.push(businessUnit)
  }

  return businessUnits
}

async function createUsersAndEmployees(businessUnits: { id: string }[]) {
  const passwordHash = await bcrypt.hash("password123", 10)

  const userData = [
    { email: "admin@hotel.com", name: "System Administrator", businessUnit: businessUnits[0] },
    { email: "manager@hotel.com", name: "Hotel Manager", businessUnit: businessUnits[0] },
    { email: "frontdesk@hotel.com", name: "Front Desk Agent", businessUnit: businessUnits[0] },
    { email: "housekeeping@hotel.com", name: "Housekeeping Supervisor", businessUnit: businessUnits[0] },
    { email: "chef@restaurant.com", name: "Head Chef", businessUnit: businessUnits[3] },
    { email: "waiter@restaurant.com", name: "Server", businessUnit: businessUnits[3] },
    { email: "cashier@restaurant.com", name: "Cashier", businessUnit: businessUnits[3] },
  ]

  const users = []
  const employees = []

  for (const data of userData) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        businessUnitId: data.businessUnit.id,
      },
    })
    users.push(user)

    const employee = await prisma.employee.create({
      data: {
        firstName: data.name.split(" ")[0],
        lastName: data.name.split(" ").slice(1).join(" ") || "User",
        email: data.email,
        jobTitle: data.name.includes("Manager")
          ? "Manager"
          : data.name.includes("Chef")
            ? "Chef"
            : data.name.includes("Admin")
              ? "Administrator"
              : "Staff",
        department:
          data.name.includes("Hotel") || data.name.includes("Front")
            ? "Front Office"
            : data.name.includes("Housekeeping")
              ? "Housekeeping"
              : data.name.includes("Chef") || data.name.includes("Server")
                ? "Food & Beverage"
                : "Administration",
        businessUnitId: data.businessUnit.id,
        userId: user.id,
      },
    })
    employees.push(employee)
  }

  return { users, employees }
}

async function createRBAC(users: { id: string }[]) {
  // Create permissions
  const permissions = [
    { module: "HOTEL", action: "CREATE", resource: "BOOKING" },
    { module: "HOTEL", action: "READ", resource: "BOOKING" },
    { module: "HOTEL", action: "UPDATE", resource: "BOOKING" },
    { module: "HOTEL", action: "DELETE", resource: "BOOKING" },
    { module: "POS", action: "CREATE", resource: "ORDER" },
    { module: "POS", action: "READ", resource: "ORDER" },
    { module: "INVENTORY", action: "CREATE", resource: "ITEM" },
    { module: "INVENTORY", action: "READ", resource: "ITEM" },
    { module: "ACCOUNTING", action: "READ", resource: "REPORT" },
    { module: "SYSTEM", action: "ADMIN", resource: "ALL" },
  ]

  const createdPermissions = []
  for (const perm of permissions) {
    const permission = await prisma.permission.create({ data: perm })
    createdPermissions.push(permission)
  }

  // Create roles
  const roles = [
    { name: "Administrator", description: "Full system access" },
    { name: "Hotel Manager", description: "Hotel operations management" },
    { name: "Front Desk Agent", description: "Guest services and bookings" },
    { name: "Restaurant Manager", description: "Restaurant operations" },
    { name: "Server", description: "POS and order management" },
  ]

  const createdRoles = []
  for (const role of roles) {
    const createdRole = await prisma.role.create({ data: role })
    createdRoles.push(createdRole)

    // Assign permissions to roles
    if (role.name === "Administrator") {
      // Admin gets all permissions
      for (const permission of createdPermissions) {
        await prisma.rolePermission.create({
          data: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        })
      }
    } else if (role.name === "Hotel Manager") {
      // Hotel manager gets hotel and some inventory permissions
      const hotelPerms = createdPermissions.filter(
        (p) => p.module === "HOTEL" || (p.module === "INVENTORY" && p.action === "READ"),
      )
      for (const permission of hotelPerms) {
        await prisma.rolePermission.create({
          data: {
            roleId: createdRole.id,
            permissionId: permission.id,
          },
        })
      }
    }
  }

  // Assign roles to users
  await prisma.userRole.create({
    data: { userId: users[0].id, roleId: createdRoles[0].id }, // Admin
  })
  await prisma.userRole.create({
    data: { userId: users[1].id, roleId: createdRoles[1].id }, // Hotel Manager
  })
  await prisma.userRole.create({
    data: { userId: users[2].id, roleId: createdRoles[2].id }, // Front Desk
  })
}

async function createBusinessPartners() {
  const partners = [
    // Customers/Guests
    { code: "CUST001", name: "John Smith", type: "CUSTOMER", email: "john.smith@email.com", phone: "+1-555-0101" },
    { code: "CUST002", name: "Sarah Johnson", type: "CUSTOMER", email: "sarah.j@email.com", phone: "+1-555-0102" },
    { code: "CUST003", name: "Michael Brown", type: "CUSTOMER", email: "mbrown@email.com", phone: "+1-555-0103" },

    // Suppliers
    {
      code: "SUPP001",
      name: "Fresh Foods Distributor",
      type: "SUPPLIER",
      email: "orders@freshfoods.com",
      phone: "+1-555-0201",
    },
    {
      code: "SUPP002",
      name: "Hotel Supplies Inc",
      type: "SUPPLIER",
      email: "sales@hotelsupplies.com",
      phone: "+1-555-0202",
    },
    { code: "SUPP003", name: "Linen & More", type: "SUPPLIER", email: "info@linenmore.com", phone: "+1-555-0203" },

    // Corporate Clients
    {
      code: "CORP001",
      name: "Tech Solutions Corp",
      type: "CUSTOMER",
      email: "travel@techsolutions.com",
      phone: "+1-555-0301",
    },
    {
      code: "CORP002",
      name: "Global Consulting Group",
      type: "CUSTOMER",
      email: "bookings@globalconsult.com",
      phone: "+1-555-0302",
    },
  ]

  const businessPartners = []
  for (const partner of partners) {
    const businessPartner = await prisma.businessPartner.create({
      data: {
        ...partner,
        type: partner.type as "CUSTOMER" | "SUPPLIER" | "EMPLOYEE"
      },
    })
    businessPartners.push(businessPartner)

    // Add addresses
    await prisma.businessPartnerAddress.create({
      data: {
        name: "Primary Address",
        street: `${Math.floor(Math.random() * 9999)} Main Street`,
        city: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        country: "USA",
        type: "BILLING",
        businessPartnerId: businessPartner.id,
        isDefault: true,
      },
    })
  }

  return businessPartners
}

async function createAccountingStructure() {
  // Create chart of accounts
  const accounts = [
    // Assets
    { code: "1000", name: "Cash and Cash Equivalents", type: "ASSET", subType: "CURRENT_ASSET" },
    { code: "1100", name: "Accounts Receivable", type: "ASSET", subType: "CURRENT_ASSET" },
    { code: "1200", name: "Inventory", type: "ASSET", subType: "CURRENT_ASSET" },
    { code: "1500", name: "Property, Plant & Equipment", type: "ASSET", subType: "FIXED_ASSET" },

    // Liabilities
    { code: "2000", name: "Accounts Payable", type: "LIABILITY", subType: "CURRENT_LIABILITY" },
    { code: "2100", name: "Accrued Expenses", type: "LIABILITY", subType: "CURRENT_LIABILITY" },
    { code: "2500", name: "Long-term Debt", type: "LIABILITY", subType: "LONG_TERM_LIABILITY" },

    // Equity
    { code: "3000", name: "Owner's Equity", type: "EQUITY", subType: "EQUITY" },
    { code: "3100", name: "Retained Earnings", type: "EQUITY", subType: "EQUITY" },

    // Revenue
    { code: "4000", name: "Room Revenue", type: "REVENUE", subType: "OPERATING_REVENUE" },
    { code: "4100", name: "Food & Beverage Revenue", type: "REVENUE", subType: "OPERATING_REVENUE" },
    { code: "4200", name: "Other Revenue", type: "REVENUE", subType: "OPERATING_REVENUE" },

    // Expenses
    { code: "5000", name: "Cost of Goods Sold", type: "EXPENSE", subType: "OPERATING_EXPENSE" },
    { code: "5100", name: "Payroll Expenses", type: "EXPENSE", subType: "OPERATING_EXPENSE" },
    { code: "5200", name: "Utilities", type: "EXPENSE", subType: "OPERATING_EXPENSE" },
    { code: "5300", name: "Marketing & Advertising", type: "EXPENSE", subType: "OPERATING_EXPENSE" },
  ]

  const createdAccounts = []
  for (const account of accounts) {
    const createdAccount = await prisma.account.create({ data: account })
    createdAccounts.push(createdAccount)
  }

  // Create fiscal year and periods
  const fiscalYear = await prisma.fiscalYear.create({
    data: {
      name: "2024",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    },
  })

  // Create monthly periods
  for (let month = 1; month <= 12; month++) {
    await prisma.financialPeriod.create({
      data: {
        name: `2024-${month.toString().padStart(2, "0")}`,
        code: `2024${month.toString().padStart(2, "0")}`,
        startDate: new Date(2024, month - 1, 1),
        endDate: new Date(2024, month, 0),
        fiscalYearId: fiscalYear.id,
      },
    })
  }

  // Create tax groups and codes
  const taxGroup = await prisma.taxGroup.create({
    data: { code: "STD", name: "Standard Tax" },
  })

  await prisma.taxCode.create({
    data: {
      code: "VAT10",
      name: "VAT 10%",
      rate: 10.0,
      taxGroupId: taxGroup.id,
    },
  })

  // Create payment terms
  await prisma.paymentTerm.create({
    data: {
      code: "NET30",
      name: "Net 30 Days",
      dueDays: 30,
    },
  })

  return createdAccounts
}

async function createInventoryStructure(businessUnits: { id: string }[]) {
  // Create item groups
  const itemGroups = [
    { name: "Food & Beverages" },
    { name: "Room Amenities" },
    { name: "Cleaning Supplies" },
    { name: "Office Supplies" },
    { name: "Maintenance Items" },
  ]

  const createdItemGroups = []
  for (const group of itemGroups) {
    const itemGroup = await prisma.itemGroup.create({ data: group })
    createdItemGroups.push(itemGroup)
  }

  // Create warehouses
  const warehouses = [
    { code: "MAIN", name: "Main Warehouse" },
    { code: "KITCHEN", name: "Kitchen Storage" },
    { code: "BAR", name: "Bar Storage" },
    { code: "HOUSEKEEP", name: "Housekeeping Storage" },
  ]

  const createdWarehouses = []
  for (const warehouse of warehouses) {
    const createdWarehouse = await prisma.warehouse.create({ data: warehouse })
    createdWarehouses.push(createdWarehouse)
  }

  // Create items
  const items = [
    // Food & Beverages
    {
      code: "BEEF001",
      name: "Premium Beef Steak",
      type: "INVENTORY",
      price: 25.0,
      cost: 15.0,
      itemGroupId: createdItemGroups[0].id,
    },
    {
      code: "WINE001",
      name: "House Red Wine",
      type: "INVENTORY",
      price: 8.0,
      cost: 4.0,
      itemGroupId: createdItemGroups[0].id,
    },
    {
      code: "PASTA001",
      name: "Fresh Pasta",
      type: "INVENTORY",
      price: 12.0,
      cost: 3.0,
      itemGroupId: createdItemGroups[0].id,
    },

    // Room Amenities
    {
      code: "TOWEL001",
      name: "Bath Towel Set",
      type: "INVENTORY",
      price: 0.0,
      cost: 15.0,
      itemGroupId: createdItemGroups[1].id,
    },
    {
      code: "SOAP001",
      name: "Luxury Soap",
      type: "INVENTORY",
      price: 0.0,
      cost: 2.5,
      itemGroupId: createdItemGroups[1].id,
    },

    // Services
    {
      code: "ROOM001",
      name: "Standard Room",
      type: "SERVICE",
      price: 150.0,
      cost: 0.0,
      itemGroupId: createdItemGroups[1].id,
    },
    {
      code: "ROOM002",
      name: "Deluxe Room",
      type: "SERVICE",
      price: 200.0,
      cost: 0.0,
      itemGroupId: createdItemGroups[1].id,
    },
    { code: "ROOM003", name: "Suite", type: "SERVICE", price: 350.0, cost: 0.0, itemGroupId: createdItemGroups[1].id },
    
    // Menu Items for Restaurant
    {
      code: "MENU001",
      name: "Margherita Pizza",
      type: "M",
      price: 18.99,
      cost: 8.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id, // Restaurant business unit
    },
    {
      code: "MENU002",
      name: "Pepperoni Pizza",
      type: "M",
      price: 20.99,
      cost: 9.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU003",
      name: "Caesar Salad",
      type: "M",
      price: 12.99,
      cost: 5.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU004",
      name: "Chicken Pasta",
      type: "M",
      price: 16.99,
      cost: 7.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU005",
      name: "Beef Burger",
      type: "M",
      price: 14.99,
      cost: 6.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU006",
      name: "Fish & Chips",
      type: "M",
      price: 15.99,
      cost: 7.00,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU007",
      name: "Coca Cola",
      type: "M",
      price: 3.99,
      cost: 1.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU008",
      name: "Coffee",
      type: "M",
      price: 4.99,
      cost: 1.80,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU009",
      name: "Chocolate Cake",
      type: "M",
      price: 8.99,
      cost: 3.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
    {
      code: "MENU010",
      name: "Ice Cream",
      type: "M",
      price: 6.99,
      cost: 2.50,
      itemGroupId: createdItemGroups[0].id,
      businessUnitId: businessUnits[1].id,
    },
  ]

  const createdItems = []
  for (const item of items) {
    const createdItem = await prisma.item.create({ data: item })
    createdItems.push(createdItem)

    // Create item warehouse records
    for (const warehouse of createdWarehouses) {
      if (item.type === "INVENTORY") {
        await prisma.itemWarehouse.create({
          data: {
            itemId: createdItem.id,
            warehouseId: warehouse.id,
            onHand: Math.floor(Math.random() * 100) + 10,
            avgCost: item.cost,
          },
        })
      }
    }
  }

  return { itemGroups: createdItemGroups, items: createdItems, warehouses: createdWarehouses }
}

async function createHotelStructure(businessUnits: { id: string }[]) {
  // Create room types
  const roomTypes = [
    { name: "Standard Room", description: "Comfortable standard accommodation", baseRate: 150.0, maxOccupancy: 2 },
    { name: "Deluxe Room", description: "Spacious room with city view", baseRate: 200.0, maxOccupancy: 2 },
    { name: "Junior Suite", description: "Suite with separate living area", baseRate: 280.0, maxOccupancy: 3 },
    { name: "Executive Suite", description: "Luxury suite with premium amenities", baseRate: 350.0, maxOccupancy: 4 },
  ]

  const createdRoomTypes = []
  for (const roomType of roomTypes) {
    const createdRoomType = await prisma.hotelRoomType.create({ data: roomType })
    createdRoomTypes.push(createdRoomType)
  }

  // Create rooms for the first business unit (hotel)
  const hotelBusinessUnit = businessUnits[0]
  const rooms = []

  for (let floor = 1; floor <= 5; floor++) {
    for (let roomNum = 1; roomNum <= 10; roomNum++) {
      const roomNumber = `${floor}${roomNum.toString().padStart(2, "0")}`
      const roomTypeIndex = Math.floor(Math.random() * createdRoomTypes.length)

      const room = await prisma.hotelRoom.create({
        data: {
          number: roomNumber,
          businessUnitId: hotelBusinessUnit.id,
          roomTypeId: createdRoomTypes[roomTypeIndex].id,
          status: (["AVAILABLE", "OCCUPIED", "OUT_OF_ORDER"][Math.floor(Math.random() * 3)]) as "AVAILABLE" | "OCCUPIED" | "OUT_OF_ORDER",
          housekeepingStatus: (["CLEAN", "DIRTY", "INSPECT"][Math.floor(Math.random() * 3)]) as "CLEAN" | "DIRTY" | "INSPECT",
        },
      })
      rooms.push(room)
    }
  }

  // Create rate plans
  const ratePlans = []
  for (const roomType of createdRoomTypes) {
    const ratePlan = await prisma.ratePlan.create({
      data: {
        name: `Standard Rate - ${roomType.name}`,
        roomTypeId: roomType.id,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        rate: roomType.baseRate,
      },
    })
    ratePlans.push(ratePlan)
  }

  // Create booking channels
  const channels = [
    { name: "Direct Booking", channelType: "DIRECT", commission: 0 },
    { name: "Booking.com", channelType: "OTA", commission: 15 },
    { name: "Expedia", channelType: "OTA", commission: 18 },
    { name: "Corporate Direct", channelType: "CORPORATE", commission: 0 },
  ]

  const createdChannels = []
  for (const channel of channels) {
    const createdChannel = await prisma.bookingChannel.create({ data: channel })
    createdChannels.push(createdChannel)
  }

  return {
    roomTypes: createdRoomTypes,
    rooms,
    ratePlans,
    channels: createdChannels,
  }
}

async function createPOSStructure(businessUnits: { id: string }[], items: { id: string }[]) {
  const restaurantBusinessUnit = businessUnits[3] // City Center Restaurant

  // Create POS terminals
  const terminals = [
    { name: "Main Counter Terminal", businessUnitId: restaurantBusinessUnit.id },
    { name: "Bar Terminal", businessUnitId: restaurantBusinessUnit.id },
    { name: "Mobile Terminal 1", businessUnitId: restaurantBusinessUnit.id },
  ]

  const createdTerminals = []
  for (const terminal of terminals) {
    const createdTerminal = await prisma.pOSTerminal.create({ data: terminal })
    createdTerminals.push(createdTerminal)
  }

  // Create restaurant tables
  const tables = []
  for (let i = 1; i <= 20; i++) {
    const table = await prisma.restaurantTable.create({
      data: {
        number: `T${i.toString().padStart(2, "0")}`,
        capacity: [2, 4, 6, 8][Math.floor(Math.random() * 4)],
        businessUnitId: restaurantBusinessUnit.id,
      },
    })
    tables.push(table)
  }

  // Create payment methods
  const paymentMethods = [
    { name: "Cash", type: "CASH" },
    { name: "Credit Card", type: "CARD" },
    { name: "Debit Card", type: "CARD" },
    { name: "Mobile Payment", type: "DIGITAL" },
    { name: "Room Charge", type: "ROOM_CHARGE" },
  ]

  const createdPaymentMethods = []
  for (const method of paymentMethods) {
    const createdMethod = await prisma.paymentMethod.create({ data: method })
    createdPaymentMethods.push(createdMethod)
  }

  // Create kitchen stations
  const kitchenStations = [
    { name: "Grill Station" },
    { name: "Cold Station" },
    { name: "Hot Station" },
    { name: "Dessert Station" },
    { name: "Bar Station" },
  ]

  const createdKitchenStations = []
  for (const station of kitchenStations) {
    const createdStation = await prisma.kitchenStation.create({ data: station })
    createdKitchenStations.push(createdStation)
  }

  // Create promotions
  const promotions = [
    {
      name: "Happy Hour",
      type: "PERCENTAGE",
      value: 20.0,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-12-31"),
    },
    {
      name: "Early Bird Special",
      type: "FIXED_AMOUNT",
      value: 5.0,
      validFrom: new Date("2024-01-01"),
      validTo: new Date("2024-12-31"),
    },
  ]

  const createdPromotions = []
  for (const promotion of promotions) {
    const createdPromotion = await prisma.promotion.create({ data: promotion })
    createdPromotions.push(createdPromotion)
  }

  return {
    terminals: createdTerminals,
    tables,
    paymentMethods: createdPaymentMethods,
    kitchenStations: createdKitchenStations,
    promotions: createdPromotions,
  }
}

async function createSampleTransactions(
  businessUnits: { id: string }[],
  businessPartners: { id: string; type: string }[],
  items: { id: string; code: string; name: string; type: string; price: Decimal; cost: Decimal }[],
  employees: { id: string; userId: string | null }[],
  hotelData: { rooms: { id: string; status: string }[]; ratePlans: { id: string }[]; channels: { id: string }[] },
  posData: { terminals: { id: string }[]; tables: { id: string }[]; paymentMethods: { id: string }[] },
) {
  const hotelBusinessUnit = businessUnits[0]
  const restaurantBusinessUnit = businessUnits[3]

  // Create hotel bookings
  const guests = businessPartners.filter((bp) => bp.type === "Customer").slice(0, 3)
  const availableRooms = hotelData.rooms.filter((r) => r.status === "AVAILABLE").slice(0, 5)

  for (let i = 0; i < Math.min(guests.length, availableRooms.length); i++) {
    const checkInDate = new Date()
    checkInDate.setDate(checkInDate.getDate() + Math.floor(Math.random() * 30))
    const checkOutDate = new Date(checkInDate)
    checkOutDate.setDate(checkOutDate.getDate() + Math.floor(Math.random() * 7) + 1)

    const booking = await prisma.hotelBooking.create({
      data: {
        confirmationCode: `BK${Date.now()}${i}`,
        guestId: guests[i].id,
        roomId: availableRooms[i].id,
        ratePlanId: hotelData.ratePlans[0].id,
        channelId: hotelData.channels[Math.floor(Math.random() * hotelData.channels.length)].id,
        checkInDate,
        checkOutDate,
        totalAmount: 150.0 * Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)),
        businessUnitId: hotelBusinessUnit.id,
      },
    })

    // Create folio for booking
    await prisma.folio.create({
      data: {
        bookingId: booking.id,
        balance: booking.totalAmount,
      },
    })
  }

  // Create POS orders
  const customers = businessPartners.filter((bp) => bp.type === "Customer")
  const foodItems = items.filter(
    (item) => item.code.startsWith("BEEF") || item.code.startsWith("WINE") || item.code.startsWith("PASTA"),
  )

  for (let i = 0; i < 10; i++) {
    // Create POS shift first
    const shift = await prisma.pOSShift.create({
      data: {
        startAmount: 100.0,
        userId: employees[Math.floor(Math.random() * employees.length)].userId!,
        terminalId: posData.terminals[0].id,
      },
    })

    const order = await prisma.pOSOrder.create({
      data: {
        number: `POS${Date.now()}${i}`,
        orderType: ["Dine-in", "Takeaway", "Delivery"][Math.floor(Math.random() * 3)],
        businessUnitId: restaurantBusinessUnit.id,
        terminalId: posData.terminals[0].id,
        shiftId: shift.id,
        tableId: posData.tables[Math.floor(Math.random() * posData.tables.length)].id,
        customerId: customers[Math.floor(Math.random() * customers.length)].id,
        totalBeforeTax: 0,
        taxAmount: 0,
        totalAmount: 0,
      },
    })

    let totalBeforeTax = 0
    // Add order lines
    for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
      const item = foodItems[Math.floor(Math.random() * foodItems.length)]
      const quantity = Math.floor(Math.random() * 3) + 1
             const lineTotal = Number(item.price) * quantity

      await prisma.pOSOrderLine.create({
        data: {
          posOrderId: order.id,
          itemId: item.id,
          description: item.name,
          quantity,
          unitPrice: item.price,
          lineTotal,
        },
      })

      totalBeforeTax += lineTotal
    }

    const taxAmount = totalBeforeTax * 0.1 // 10% tax
    const totalAmount = totalBeforeTax + taxAmount

    // Update order totals
    await prisma.pOSOrder.update({
      where: { id: order.id },
      data: {
        totalBeforeTax,
        taxAmount,
        totalAmount,
      },
    })

    // Add payment
    await prisma.pOSPayment.create({
      data: {
        posOrderId: order.id,
        paymentMethodId: posData.paymentMethods[Math.floor(Math.random() * posData.paymentMethods.length)].id,
        amount: totalAmount,
      },
    })
  }

  // Create purchase requests
  const suppliers = businessPartners.filter((bp) => bp.type === "SUPPLIER")
  const inventoryItems = items.filter((item) => item.type === "INVENTORY")

  for (let i = 0; i < 3; i++) {
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        number: `PR${Date.now()}${i}`,
        requestDate: new Date(),
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        businessUnitId: businessUnits[0].id,
        requesterId: employees[0].id,
        supplierId: suppliers[Math.floor(Math.random() * suppliers.length)].id,
        totalAmount: 0,
      },
    })

    let totalAmount = 0
    // Add request lines
    for (let j = 0; j < Math.floor(Math.random() * 5) + 1; j++) {
      const item = inventoryItems[Math.floor(Math.random() * inventoryItems.length)]
      const quantity = Math.floor(Math.random() * 50) + 10
             const lineTotal = Number(item.cost) * quantity

      await prisma.purchaseRequestLine.create({
        data: {
          purchaseRequestId: purchaseRequest.id,
          itemId: item.id,
          description: item.name,
          quantity,
          estimatedPrice: item.cost,
          lineTotal,
        },
      })

      totalAmount += lineTotal
    }

    // Update total amount
    await prisma.purchaseRequest.update({
      where: { id: purchaseRequest.id },
      data: { totalAmount },
    })
  }

  console.log("📊 Sample transactions created successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
