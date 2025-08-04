import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Helper function to get random date within last 3 months
function getRandomDateInLast3Months(): Date {
  const now = new Date()
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
  return faker.date.between({ from: threeMonthsAgo, to: now })
}

// Helper function to get random future date within next 3 months
function getRandomDateInNext3Months(): Date {
  const now = new Date()
  const threeMonthsFromNow = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
  return faker.date.between({ from: now, to: threeMonthsFromNow })
}

async function main() {
  console.log("🌱 Starting seed...")

  // =================================================================
  // 1. FOUNDATIONAL DATA
  // =================================================================
  console.log("📊 Creating foundational data...")

  // Currencies
  const currencies = await Promise.all([
    prisma.currency.create({
      data: {
        code: "USD",
        name: "US Dollar",
        symbol: "$",
        isBase: true,
      },
    }),
    prisma.currency.create({
      data: {
        code: "PHP",
        name: "Philippine Peso",
        symbol: "₱",
        isBase: false,
      },
    }),
    prisma.currency.create({
      data: {
        code: "EUR",
        name: "Euro",
        symbol: "€",
        isBase: false,
      },
    }),
  ])

  // Exchange Rates
  for (let i = 0; i < 90; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    await prisma.exchangeRate.create({
      data: {
        fromCurrencyId: currencies[0].id, // USD
        toCurrencyId: currencies[1].id, // PHP
        rate: faker.number.float({ min: 55, max: 58, fractionDigits: 2 }),
        effectiveDate: date,
      },
    })
  }

  // Business Units
  const businessUnits = await Promise.all([
    prisma.businessUnit.create({
      data: {
        name: "Tropicana Hotel - General Santos",
        code: "THGS",
      },
    }),
    prisma.businessUnit.create({
      data: {
        name: "Tropicana Restaurant - Makati",
        code: "TRMK",
      },
    }),
    prisma.businessUnit.create({
      data: {
        name: "Corporate Headquarters",
        code: "CORP",
      },
    }),
  ])

  // Roles and Permissions
  const permissions = await Promise.all([
    prisma.permission.create({ data: { module: "POS", action: "CREATE", resource: "ORDER" } }),
    prisma.permission.create({ data: { module: "POS", action: "READ", resource: "ORDER" } }),
    prisma.permission.create({ data: { module: "POS", action: "UPDATE", resource: "ORDER" } }),
    prisma.permission.create({ data: { module: "POS", action: "DELETE", resource: "ORDER" } }),
    prisma.permission.create({ data: { module: "HOTEL", action: "CREATE", resource: "BOOKING" } }),
    prisma.permission.create({ data: { module: "HOTEL", action: "READ", resource: "BOOKING" } }),
    prisma.permission.create({ data: { module: "HOTEL", action: "UPDATE", resource: "BOOKING" } }),
    prisma.permission.create({ data: { module: "INVENTORY", action: "CREATE", resource: "ITEM" } }),
    prisma.permission.create({ data: { module: "INVENTORY", action: "READ", resource: "ITEM" } }),
    prisma.permission.create({ data: { module: "PURCHASING", action: "APPROVE", resource: "REQUEST" } }),
  ])

  const roles = await Promise.all([
    prisma.role.create({
      data: {
        name: "Administrator",
        description: "Full system access",
      },
    }),
    prisma.role.create({
      data: {
        name: "Hotel Manager",
        description: "Hotel operations management",
      },
    }),
    prisma.role.create({
      data: {
        name: "Restaurant Manager",
        description: "Restaurant operations management",
      },
    }),
    prisma.role.create({
      data: {
        name: "Front Desk",
        description: "Hotel front desk operations",
      },
    }),
    prisma.role.create({
      data: {
        name: "Cashier",
        description: "POS operations",
      },
    }),
  ])

  // Role Permissions
  for (const role of roles) {
    const permissionCount = faker.number.int({ min: 3, max: 8 })
    const selectedPermissions = faker.helpers.arrayElements(permissions, permissionCount)

    for (const permission of selectedPermissions) {
      await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      })
    }
  }

  // =================================================================
  // 2. USERS AND EMPLOYEES
  // =================================================================
  console.log("👥 Creating users and employees...")

  const users = []
  const employees = []

  for (let i = 0; i < 25; i++) {
    const businessUnit = faker.helpers.arrayElement(businessUnits)
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const email = faker.internet.email({ firstName, lastName })

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        jobTitle: faker.person.jobTitle(),
        department: faker.helpers.arrayElement([
          "Front Office",
          "Housekeeping",
          "F&B",
          "Kitchen",
          "Maintenance",
          "Administration",
        ]),
        email,
        businessUnitId: businessUnit.id,
      },
    })

    const user = await prisma.user.create({
      data: {
        email,
        name: `${firstName} ${lastName}`,
        password: "$2b$10$K7L/8Y75aL7rCUDlO8.Ouuy56YcjisADUBdHBWW63obrSMPjSg.VW", // "password123"
        businessUnitId: businessUnit.id,
        employee: {
          connect: { id: employee.id },
        },
      },
    })

    // Assign roles
    const userRoles = faker.helpers.arrayElements(roles, faker.number.int({ min: 1, max: 2 }))
    for (const role of userRoles) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      })
    }

    users.push(user)
    employees.push(employee)
  }

  // =================================================================
  // 3. INVENTORY SETUP
  // =================================================================
  console.log("📦 Creating inventory data...")

  // UOM Groups and UOMs
  const uomGroups = await Promise.all([
    prisma.unitOfMeasureGroup.create({
      data: {
        name: "Weight",
        uoms: {
          create: [
            { name: "Gram", code: "g", baseUoM: "g", conversionFactor: 1 },
            { name: "Kilogram", code: "kg", baseUoM: "g", conversionFactor: 1000 },
            { name: "Pound", code: "lb", baseUoM: "g", conversionFactor: 453.592 },
          ],
        },
      },
    }),
    prisma.unitOfMeasureGroup.create({
      data: {
        name: "Volume",
        uoms: {
          create: [
            { name: "Milliliter", code: "ml", baseUoM: "ml", conversionFactor: 1 },
            { name: "Liter", code: "l", baseUoM: "ml", conversionFactor: 1000 },
            { name: "Gallon", code: "gal", baseUoM: "ml", conversionFactor: 3785.41 },
          ],
        },
      },
    }),
    prisma.unitOfMeasureGroup.create({
      data: {
        name: "Count",
        uoms: {
          create: [
            { name: "Piece", code: "pc", baseUoM: "pc", conversionFactor: 1 },
            { name: "Dozen", code: "dz", baseUoM: "pc", conversionFactor: 12 },
            { name: "Case", code: "cs", baseUoM: "pc", conversionFactor: 24 },
          ],
        },
      },
    }),
  ])

  // Item Groups
  const itemGroups = await Promise.all([
    prisma.itemGroup.create({ data: { groupName: "Food & Beverage" } }),
    prisma.itemGroup.create({ data: { groupName: "Room Amenities" } }),
    prisma.itemGroup.create({ data: { groupName: "Cleaning Supplies" } }),
    prisma.itemGroup.create({ data: { groupName: "Office Supplies" } }),
    prisma.itemGroup.create({ data: { groupName: "Maintenance" } }),
    prisma.itemGroup.create({ data: { groupName: "Hotel Services" } }),
    prisma.itemGroup.create({ data: { groupName: "Menu Items" } }),
  ])

  // Warehouses
  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { whsCode: "MAIN", whsName: "Main Warehouse" } }),
    prisma.warehouse.create({ data: { whsCode: "KITCHEN", whsName: "Kitchen Storage" } }),
    prisma.warehouse.create({ data: { whsCode: "BAR", whsName: "Bar Storage" } }),
    prisma.warehouse.create({ data: { whsCode: "HOUSE", whsName: "Housekeeping Storage" } }),
  ])

  // Items
  const items = []
  const itemTypes = [
    {
      type: "I",
      group: itemGroups[0],
      names: [
        "Beef Tenderloin",
        "Chicken Breast",
        "Fresh Salmon",
        "Prawns",
        "Vegetables Mix",
        "Rice",
        "Pasta",
        "Olive Oil",
        "Wine",
        "Beer",
      ],
    },
    {
      type: "I",
      group: itemGroups[1],
      names: ["Towels", "Bed Sheets", "Pillows", "Blankets", "Toiletries", "Shampoo", "Soap", "Tissue Paper"],
    },
    {
      type: "I",
      group: itemGroups[2],
      names: ["Detergent", "Disinfectant", "Glass Cleaner", "Floor Wax", "Vacuum Bags"],
    },
    {
      type: "S",
      group: itemGroups[5],
      names: ["Room Service", "Laundry Service", "Spa Treatment", "Airport Transfer", "Tour Package"],
    },
    {
      type: "H",
      group: itemGroups[5],
      names: ["Deluxe King Room", "Standard Twin Room", "Suite", "Presidential Suite"],
    },
    {
      type: "M",
      group: itemGroups[6],
      names: [
        "Grilled Steak",
        "Pasta Carbonara",
        "Caesar Salad",
        "Fish & Chips",
        "Chocolate Cake",
        "Coffee",
        "Fresh Juice",
      ],
    },
  ]

  for (const itemType of itemTypes) {
    for (const name of itemType.names) {
      const item = await prisma.item.create({
        data: {
          itemCode: faker.string.alphanumeric(8).toUpperCase(),
          itemName: name,
          itemType: itemType.type,
          price: faker.number.float({ min: 10, max: 500, fractionDigits: 2 }),
          avgCost: faker.number.float({ min: 5, max: 300, fractionDigits: 2 }),
          currency: "USD",
          itemGroupId: itemType.group.id,
          uomGroupId: faker.helpers.arrayElement(uomGroups).id,
        },
      })
      items.push(item)
    }
  }

  // Item Warehouses (Inventory Levels)
  for (const item of items) {
    if (item.itemType === "I") {
      // Only for inventory items
      for (const warehouse of warehouses) {
        await prisma.itemWarehouse.create({
          data: {
            itemId: item.id,
            warehouseId: warehouse.id,
            onHand: faker.number.float({ min: 0, max: 1000, fractionDigits: 2 }),
            committed: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
            onOrder: faker.number.float({ min: 0, max: 200, fractionDigits: 2 }),
            avgCost: item.avgCost,
          },
        })
      }
    }
  }

  // =================================================================
  // 4. BUSINESS PARTNERS
  // =================================================================
  console.log("🤝 Creating business partners...")

  const businessPartners = []

  // Suppliers
  for (let i = 0; i < 15; i++) {
    const supplier = await prisma.businessPartner.create({
      data: {
        cardCode: `S${faker.string.numeric(5)}`,
        cardName: faker.company.name(),
        cardType: "S",
        groupCode: 100,
        email: faker.internet.email(),
        phone1: faker.phone.number(),
        balance: faker.number.float({ min: -10000, max: 5000, fractionDigits: 2 }),
        addresses: {
          create: [
            {
              addressName: "Billing Address",
              street: faker.location.streetAddress(),
              city: faker.location.city(),
              zipCode: faker.location.zipCode(),
              country: faker.location.country(),
              addressType: "bo_BillTo",
            },
          ],
        },
      },
    })
    businessPartners.push(supplier)
  }

  // Customers/Guests
  for (let i = 0; i < 50; i++) {
    const customer = await prisma.businessPartner.create({
      data: {
        cardCode: `C${faker.string.numeric(5)}`,
        cardName: faker.person.fullName(),
        cardType: faker.helpers.arrayElement(["C", "G"]),
        groupCode: 200,
        email: faker.internet.email(),
        phone1: faker.phone.number(),
        balance: faker.number.float({ min: 0, max: 2000, fractionDigits: 2 }),
        addresses: {
          create: [
            {
              addressName: "Home Address",
              street: faker.location.streetAddress(),
              city: faker.location.city(),
              zipCode: faker.location.zipCode(),
              country: faker.location.country(),
              addressType: "bo_BillTo",
            },
          ],
        },
      },
    })
    businessPartners.push(customer)
  }

  // =================================================================
  // 5. FINANCIAL SETUP
  // =================================================================
  console.log("💰 Creating financial data...")

  // Fiscal Year and Periods
  const fiscalYear = await prisma.fiscalYear.create({
    data: {
      name: "Fiscal Year 2024",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      status: "Open",
    },
  })

  const periods = []
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(2024, month, 1)
    const endDate = new Date(2024, month + 1, 0)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const period = await prisma.financialPeriod.create({
      data: {
        name: `${monthNames[month]} 2024`,
        code: `2024${(month + 1).toString().padStart(2, "0")}`,
        startDate,
        endDate,
        fiscalYearId: fiscalYear.id,
      },
    })
    periods.push(period)
  }

  // Chart of Accounts
  const accounts = await Promise.all([
    prisma.account.create({ data: { acctCode: "1000", acctName: "Cash", acctType: "asset", balance: 50000 } }),
    prisma.account.create({
      data: { acctCode: "1100", acctName: "Accounts Receivable", acctType: "asset", balance: 25000 },
    }),
    prisma.account.create({ data: { acctCode: "1200", acctName: "Inventory", acctType: "asset", balance: 75000 } }),
    prisma.account.create({ data: { acctCode: "1500", acctName: "Fixed Assets", acctType: "asset", balance: 500000 } }),
    prisma.account.create({
      data: { acctCode: "2000", acctName: "Accounts Payable", acctType: "liability", balance: 15000 },
    }),
    prisma.account.create({ data: { acctCode: "3000", acctName: "Equity", acctType: "equity", balance: 400000 } }),
    prisma.account.create({ data: { acctCode: "4000", acctName: "Room Revenue", acctType: "revenue", balance: 0 } }),
    prisma.account.create({ data: { acctCode: "4100", acctName: "F&B Revenue", acctType: "revenue", balance: 0 } }),
    prisma.account.create({ data: { acctCode: "5000", acctName: "Cost of Sales", acctType: "expense", balance: 0 } }),
    prisma.account.create({
      data: { acctCode: "6000", acctName: "Operating Expenses", acctType: "expense", balance: 0 },
    }),
  ])

  // Tax Groups and Codes
  const taxGroup = await prisma.taxGroup.create({
    data: {
      code: "VAT",
      name: "Value Added Tax",
      taxCodes: {
        create: [
          { code: "VAT12", name: "12% VAT", rate: 12 },
          { code: "VAT0", name: "0% VAT", rate: 0 },
          { code: "EXEMPT", name: "Tax Exempt", rate: 0 },
        ],
      },
    },
  })

  // =================================================================
  // 6. HOTEL SETUP
  // =================================================================
  console.log("🏨 Creating hotel data...")

  // Hotel Room Types
  const roomTypes = await Promise.all([
    prisma.hotelRoomType.create({
      data: {
        name: "Standard King",
        description: "Comfortable king-size bed room",
        baseRate: 120.0,
        item: {
          connect: { id: items.find((i) => i.itemName === "Deluxe King Room")?.id },
        },
      },
    }),
    prisma.hotelRoomType.create({
      data: {
        name: "Standard Twin",
        description: "Two single beds room",
        baseRate: 110.0,
        item: {
          connect: { id: items.find((i) => i.itemName === "Standard Twin Room")?.id },
        },
      },
    }),
    prisma.hotelRoomType.create({
      data: {
        name: "Deluxe Suite",
        description: "Spacious suite with living area",
        baseRate: 250.0,
        item: {
          connect: { id: items.find((i) => i.itemName === "Suite")?.id },
        },
      },
    }),
  ])

  // Hotel Rooms
  const hotelRooms = []
  const roomStatuses = ["Available", "Occupied", "OutOfOrder"]
  const housekeepingStatuses = ["Clean", "Dirty", "Inspect"]

  for (let floor = 1; floor <= 5; floor++) {
    for (let room = 1; room <= 20; room++) {
      const roomNumber = `${floor}${room.toString().padStart(2, "0")}`
      const hotelRoom = await prisma.hotelRoom.create({
        data: {
          roomNumber,
          status: faker.helpers.arrayElement(roomStatuses),
          housekeepingStatus: faker.helpers.arrayElement(housekeepingStatuses),
          businessUnitId: businessUnits[0].id, // Hotel business unit
          roomTypeId: faker.helpers.arrayElement(roomTypes).id,
        },
      })
      hotelRooms.push(hotelRoom)
    }
  }

  // Rate Plans
  const ratePlans = []
  for (const roomType of roomTypes) {
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

  // =================================================================
  // 7. RESTAURANT/POS SETUP
  // =================================================================
  console.log("🍽️ Creating restaurant/POS data...")

  // Menus
  const menus = await Promise.all([
    prisma.menu.create({
      data: {
        name: "Main Restaurant Menu",
        businessUnitId: businessUnits[1].id,
        categories: {
          create: [{ name: "Appetizers" }, { name: "Main Courses" }, { name: "Desserts" }, { name: "Beverages" }],
        },
      },
    }),
  ])

  // Get menu items (items with type 'M') that were actually created
  const menuItems = await prisma.item.findMany({
    where: { itemType: "M" },
  })

  // Menu Items - only proceed if we have menu items
  if (menuItems.length > 0) {
    const categories = await prisma.menuCategory.findMany()

    for (const menuItem of menuItems) {
      const category = faker.helpers.arrayElement(categories)
      await prisma.menuItem.create({
        data: {
          menuCategoryId: category.id,
          itemId: menuItem.id,
        },
      })
    }
  }

  // POS Terminals
  const posTerminals = await Promise.all([
    prisma.pOSTerminal.create({
      data: {
        name: "Main Restaurant POS",
        businessUnitId: businessUnits[1].id,
      },
    }),
    prisma.pOSTerminal.create({
      data: {
        name: "Bar POS",
        businessUnitId: businessUnits[1].id,
      },
    }),
  ])

  // Restaurant Tables
  const restaurantTables = []
  for (let i = 1; i <= 20; i++) {
    const table = await prisma.restaurantTable.create({
      data: {
        tableNumber: `T${i.toString().padStart(2, "0")}`,
        status: faker.helpers.arrayElement(["Available", "Occupied", "Reserved"]),
        businessUnitId: businessUnits[1].id,
      },
    })
    restaurantTables.push(table)
  }

  // Payment Methods
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.create({ data: { name: "Cash" } }),
    prisma.paymentMethod.create({ data: { name: "Credit Card" } }),
    prisma.paymentMethod.create({ data: { name: "Room Charge" } }),
    prisma.paymentMethod.create({ data: { name: "Gift Card" } }),
  ])

  // Discounts
  const discounts = await Promise.all([
    prisma.discount.create({ data: { name: "Senior Citizen", type: "PERCENTAGE", value: 20 } }),
    prisma.discount.create({ data: { name: "Employee Discount", type: "PERCENTAGE", value: 15 } }),
    prisma.discount.create({ data: { name: "Happy Hour", type: "PERCENTAGE", value: 10 } }),
  ])

  // =================================================================
  // 8. GENERATE TRANSACTIONAL DATA (3 MONTHS)
  // =================================================================
  console.log("📈 Generating 3 months of transactional data...")

  const suppliers = businessPartners.filter((bp) => bp.cardType === "S")
  const customers = businessPartners.filter((bp) => bp.cardType === "C" || bp.cardType === "G")
  const inventoryItems = await prisma.item.findMany({ where: { itemType: "I" } })

  // Generate data for each day in the last 3 months
  for (let day = 0; day < 90; day++) {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - day)

    // Hotel Bookings (2-5 per day)
    const bookingsPerDay = faker.number.int({ min: 2, max: 5 })
    for (let i = 0; i < bookingsPerDay; i++) {
      const guest = faker.helpers.arrayElement(customers.filter((c) => c.cardType === "G"))
      const room = faker.helpers.arrayElement(hotelRooms.filter((r) => r.status === "Available"))
      const ratePlan = faker.helpers.arrayElement(ratePlans)
      const checkInDate = faker.date.between({
        from: currentDate,
        to: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      })
      const checkOutDate = faker.date.between({
        from: checkInDate,
        to: new Date(checkInDate.getTime() + 5 * 24 * 60 * 60 * 1000),
      })

      const booking = await prisma.hotelBooking.create({
        data: {
          bookingCode: `BK${faker.string.numeric(6)}`,
          guestId: guest.id,
          roomId: room.id,
          ratePlanId: ratePlan.id,
          checkInDate,
          checkOutDate,
          status: faker.helpers.arrayElement(["Confirmed", "CheckedIn", "CheckedOut"]),
          folio: {
            create: {
              totalDebit: faker.number.float({ min: 200, max: 1000, fractionDigits: 2 }),
              totalCredit: faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
              balance: faker.number.float({ min: 100, max: 900, fractionDigits: 2 }),
            },
          },
        },
      })

      // Create folio transactions
      const folio = await prisma.folio.findUnique({ where: { bookingId: booking.id } })
      if (folio) {
        await prisma.folioTransaction.create({
          data: {
            folioId: folio.id,
            description: "Room Charge",
            amount: ratePlan.rate,
            type: "DEBIT",
          },
        })
      }
    }

    // POS Orders (5-15 per day) - only if we have menu items
    if (menuItems.length > 0) {
      const ordersPerDay = faker.number.int({ min: 5, max: 15 })
      for (let i = 0; i < ordersPerDay; i++) {
        const terminal = faker.helpers.arrayElement(posTerminals)
        const table = faker.helpers.arrayElement(restaurantTables)
        const customer = faker.helpers.arrayElement(customers)

        // Create POS Shift if needed
        let shift = await prisma.pOSShift.findFirst({
          where: {
            terminalId: terminal.id,
            status: "Open",
          },
        })

        if (!shift) {
          shift = await prisma.pOSShift.create({
            data: {
              startAmount: 500,
              userId: faker.helpers.arrayElement(users).id,
              terminalId: terminal.id,
            },
          })
        }

        const orderTotal = faker.number.float({ min: 25, max: 200, fractionDigits: 2 })
        const taxAmount = orderTotal * 0.12

        const posOrder = await prisma.pOSOrder.create({
          data: {
            docNum: Number(faker.string.numeric(6)), // Add docNum as required
            docDate: currentDate,
            totalBeforeTax: orderTotal,
            docTotal: orderTotal + taxAmount,
            taxAmount,
            orderType: faker.helpers.arrayElement(["Dine-In", "Take-Out", "Delivery"]),
            businessUnitId: businessUnits[1].id,
            terminalId: terminal.id,
            shiftId: shift.id,
            tableId: table.id,
            customerId: customer.id,
          },
        })

        // Add order lines - use the actual menu items from database
        const lineCount = faker.number.int({ min: 1, max: 5 })
        for (let j = 0; j < lineCount; j++) {
          const menuItem = faker.helpers.arrayElement(menuItems)
          const quantity = faker.number.int({ min: 1, max: 3 })
          const lineTotal = menuItem.price * quantity

          await prisma.pOSOrderLine.create({
            data: {
              posOrderId: posOrder.id,
              itemCode: menuItem.itemCode, // This should now work correctly
              description: menuItem.itemName,
              quantity,
              price: menuItem.price,
              lineTotal,
            },
          })
        }

        // Add payment
        await prisma.pOSPayment.create({
          data: {
            posOrderId: posOrder.id,
            paymentMethodId: faker.helpers.arrayElement(paymentMethods).id,
            amount: posOrder.docTotal,
          },
        })
      }
    }

    // Purchase Requests (1-3 per week)
    if (day % 7 === 0) {
      const requestCount = faker.number.int({ min: 1, max: 3 })
      for (let i = 0; i < requestCount; i++) {
        const requester = faker.helpers.arrayElement(employees)
        const supplier = faker.helpers.arrayElement(suppliers)

        const purchaseRequest = await prisma.purchaseRequest.create({
          data: {
            docNum: Number(faker.string.numeric(6)), // Add docNum as required
            docDate: currentDate,
            requiredDate: faker.date.future({ years: 0.1 }),
            comments: faker.lorem.sentence(),
            businessUnitId: requester.businessUnitId,
            requesterId: requester.id,
            supplierId: supplier.id,
          },
        })

        // Add request lines - use actual inventory items from database
        const lineCount = faker.number.int({ min: 2, max: 8 })
        for (let j = 0; j < lineCount; j++) {
          const item = faker.helpers.arrayElement(inventoryItems)
          await prisma.purchaseRequestLine.create({
            data: {
              purchaseRequestId: purchaseRequest.id,
              itemCode: item.itemCode,
              description: item.itemName,
              quantity: faker.number.float({ min: 1, max: 100, fractionDigits: 2 }),
            },
          })
        }
      }
    }

    // Housekeeping Tasks (10-20 per day)
    const housekeepingTasksPerDay = faker.number.int({ min: 10, max: 20 })
    for (let i = 0; i < housekeepingTasksPerDay; i++) {
      const room = faker.helpers.arrayElement(hotelRooms)
      const employee = faker.helpers.arrayElement(employees.filter((e) => e.department === "Housekeeping"))

      if (employee) {
        await prisma.housekeepingTask.create({
          data: {
            roomId: room.id,
            taskType: faker.helpers.arrayElement(["CLEANING", "MAINTENANCE", "INSPECTION"]),
            priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]),
            estimatedTime: faker.number.int({ min: 30, max: 120 }),
            status: faker.helpers.arrayElement(["PENDING", "IN_PROGRESS", "COMPLETED"]),
            assignedToId: employee.id,
          },
        })
      }
    }
  }

  // =================================================================
  // 9. LOYALTY PROGRAM DATA
  // =================================================================
  console.log("🎁 Creating loyalty program data...")

  const loyaltyProgram = await prisma.loyaltyProgram.create({
    data: {
      name: "Tropicana Rewards",
      description: "Earn points for every stay and dining experience",
      pointsRatio: 1.0, // 1 point per dollar
      tiers: {
        create: [
          {
            name: "Bronze",
            minimumPoints: 0,
            discountPercent: 5,
            benefits: ["Free WiFi", "Late Checkout"],
          },
          {
            name: "Silver",
            minimumPoints: 1000,
            discountPercent: 10,
            benefits: ["Free WiFi", "Late Checkout", "Room Upgrade"],
          },
          {
            name: "Gold",
            minimumPoints: 5000,
            discountPercent: 15,
            benefits: ["Free WiFi", "Late Checkout", "Room Upgrade", "Free Breakfast"],
          },
        ],
      },
    },
  })

  const tiers = await prisma.loyaltyTier.findMany({ where: { programId: loyaltyProgram.id } })

  // Assign loyalty memberships to guests
  const guests = customers.filter((c) => c.cardType === "G")
  for (const guest of guests.slice(0, 30)) {
    const points = faker.number.int({ min: 0, max: 10000 })
    const tier = tiers.find((t) => points >= t.minimumPoints) || tiers[0]

    await prisma.guestLoyalty.create({
      data: {
        guestId: guest.id,
        programId: loyaltyProgram.id,
        tierId: tier.id,
        currentPoints: points,
        totalEarned: faker.number.int({ min: points, max: points * 2 }),
        totalRedeemed: faker.number.int({ min: 0, max: points * 0.3 }),
      },
    })
  }

  console.log("✅ Seed completed successfully!")
  console.log(`Created:
  - ${businessUnits.length} Business Units
  - ${users.length} Users & Employees
  - ${items.length} Items
  - ${businessPartners.length} Business Partners
  - ${hotelRooms.length} Hotel Rooms
  - 3 months of transactional data
  - Loyalty program with member data`)
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
