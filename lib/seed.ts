import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // =================================================================
  // 1. BUSINESS UNITS
  // =================================================================
  console.log('📊 Creating Business Units...');
  
  const hotelBU = await prisma.businessUnit.upsert({
    where: { code: 'HOTEL-GSC' },
    update: {},
    create: {
      name: 'Grand Hotel of GenSan',
      code: 'HOTEL-GSC',
    },
  });

  const restaurantBU = await prisma.businessUnit.upsert({
    where: { code: 'RESTO-BAY' },
    update: {},
    create: {
      name: 'Sarangani Bay Grill',
      code: 'RESTO-BAY',
    },
  });

  const cateringBU = await prisma.businessUnit.upsert({
    where: { code: 'CATER-EVENTS' },
    update: {},
    create: {
      name: 'Events & Catering Services',
      code: 'CATER-EVENTS',
    },
  });

  // =================================================================
  // 2. EMPLOYEES
  // =================================================================
  console.log('👥 Creating Employees...');
  
  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { email: 'maria.santos@hotel.com' },
      update: {},
      create: {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@hotel.com',
        jobTitle: 'General Manager',
        department: 'Management',
        businessUnitId: hotelBU.id,
        isActive: true
      }
    }),
    prisma.employee.upsert({
      where: { email: 'juan.cruz@hotel.com' },
      update: {},
      create: {
        firstName: 'Juan',
        lastName: 'Cruz',
        email: 'juan.cruz@hotel.com',
        jobTitle: 'Restaurant Manager',
        department: 'Food & Beverage',
        businessUnitId: restaurantBU.id,
        isActive: true
      }
    }),
    prisma.employee.upsert({
      where: { email: 'ana.garcia@hotel.com' },
      update: {},
      create: {
        firstName: 'Ana',
        lastName: 'Garcia',
        email: 'ana.garcia@hotel.com',
        jobTitle: 'Cashier',
        department: 'Finance',
        businessUnitId: hotelBU.id,
        isActive: true
      }
    }),
    prisma.employee.upsert({
      where: { email: 'pedro.martinez@hotel.com' },
      update: {},
      create: {
        firstName: 'Pedro',
        lastName: 'Martinez',
        email: 'pedro.martinez@hotel.com',
        jobTitle: 'Waiter',
        department: 'Food & Beverage',
        businessUnitId: restaurantBU.id,
        isActive: true
      }
    }),
  ]);

  // =================================================================
  // 3. USERS
  // =================================================================
  console.log('👤 Creating Users...');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@hotel.com' },
      update: {},
      create: {
        email: 'admin@hotel.com',
        name: 'Admin User',
        passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: admin123
        status: 'ACTIVE',
        businessUnitId: hotelBU.id,
      }
    }),
    prisma.user.upsert({
      where: { email: 'manager@hotel.com' },
      update: {},
      create: {
        email: 'manager@hotel.com',
        name: 'Manager User',
        passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: admin123
        status: 'ACTIVE',
        businessUnitId: restaurantBU.id,
      }
    }),
    prisma.user.upsert({
      where: { email: 'cashier@hotel.com' },
      update: {},
      create: {
        email: 'cashier@hotel.com',
        name: 'Cashier User',
        passwordHash: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu8.m', // password: admin123
        status: 'ACTIVE',
        businessUnitId: hotelBU.id,
      }
    }),
  ]);

  // =================================================================
  // 4. BUSINESS PARTNERS
  // =================================================================
  console.log('🤝 Creating Business Partners...');
  
  const businessPartners = await Promise.all([
    prisma.businessPartner.upsert({
      where: { code: 'CUST001' },
      update: {},
      create: {
        code: 'CUST001',
        name: 'ABC Corporation',
        type: 'CUSTOMER',
        email: 'contact@abc.com',
        phone: '+639176789012',
        balance: 0,
        isActive: true
      }
    }),
    prisma.businessPartner.upsert({
      where: { code: 'SUPP001' },
      update: {},
      create: {
        code: 'SUPP001',
        name: 'Fresh Foods Supplier',
        type: 'SUPPLIER',
        email: 'sales@freshfoods.com',
        phone: '+639177890123',
        balance: 0,
        isActive: true
      }
    }),
    prisma.businessPartner.upsert({
      where: { code: 'GUEST001' },
      update: {},
      create: {
        code: 'GUEST001',
        name: 'John Smith',
        type: 'GUEST',
        email: 'john.smith@email.com',
        phone: '+639178901234',
        balance: 0,
        isActive: true
      }
    }),
  ]);

  // =================================================================
  // 5. ITEM GROUPS
  // =================================================================
  console.log('📦 Creating Item Groups...');
  
  const itemGroups = await Promise.all([
    prisma.itemGroup.upsert({
      where: { name: 'Food & Beverages' },
      update: {},
      create: { name: 'Food & Beverages' }
    }),
    prisma.itemGroup.upsert({
      where: { name: 'Beverages' },
      update: {},
      create: { name: 'Beverages' }
    }),
    prisma.itemGroup.upsert({
      where: { name: 'Desserts' },
      update: {},
      create: { name: 'Desserts' }
    }),
    prisma.itemGroup.upsert({
      where: { name: 'Room Amenities' },
      update: {},
      create: { name: 'Room Amenities' }
    }),
  ]);

  // =================================================================
  // 6. ITEMS (INVENTORY & SERVICES)
  // =================================================================
  console.log('🛍️ Creating Items...');
  
  const items = await Promise.all([
    // Food Items
    prisma.item.upsert({
      where: { code: 'BURGER-001' },
      update: {},
      create: {
        code: 'BURGER-001',
        name: 'Classic Beef Burger',
        type: 'SERVICE',
        price: 250,
        cost: 120,
        currency: 'PHP',
        itemGroupId: itemGroups[0].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'PIZZA-001' },
      update: {},
      create: {
        code: 'PIZZA-001',
        name: 'Margherita Pizza',
        type: 'SERVICE',
        price: 450,
        cost: 200,
        currency: 'PHP',
        itemGroupId: itemGroups[0].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'PASTA-001' },
      update: {},
      create: {
        code: 'PASTA-001',
        name: 'Spaghetti Carbonara',
        type: 'SERVICE',
        price: 320,
        cost: 150,
        currency: 'PHP',
        itemGroupId: itemGroups[0].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'SALAD-001' },
      update: {},
      create: {
        code: 'SALAD-001',
        name: 'Caesar Salad',
        type: 'SERVICE',
        price: 180,
        cost: 80,
        currency: 'PHP',
        itemGroupId: itemGroups[0].id,
        isActive: true
      }
    }),
    // Beverages
    prisma.item.upsert({
      where: { code: 'COFFEE-001' },
      update: {},
      create: {
        code: 'COFFEE-001',
        name: 'Espresso',
        type: 'SERVICE',
        price: 80,
        cost: 30,
        currency: 'PHP',
        itemGroupId: itemGroups[1].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'COFFEE-002' },
      update: {},
      create: {
        code: 'COFFEE-002',
        name: 'Cappuccino',
        type: 'SERVICE',
        price: 120,
        cost: 45,
        currency: 'PHP',
        itemGroupId: itemGroups[1].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'JUICE-001' },
      update: {},
      create: {
        code: 'JUICE-001',
        name: 'Orange Juice',
        type: 'SERVICE',
        price: 90,
        cost: 40,
        currency: 'PHP',
        itemGroupId: itemGroups[1].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'SODA-001' },
      update: {},
      create: {
        code: 'SODA-001',
        name: 'Cola',
        type: 'SERVICE',
        price: 60,
        cost: 25,
        currency: 'PHP',
        itemGroupId: itemGroups[1].id,
        isActive: true
      }
    }),
    // Desserts
    prisma.item.upsert({
      where: { code: 'CAKE-001' },
      update: {},
      create: {
        code: 'CAKE-001',
        name: 'Chocolate Cake',
        type: 'SERVICE',
        price: 150,
        cost: 70,
        currency: 'PHP',
        itemGroupId: itemGroups[2].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'ICE-001' },
      update: {},
      create: {
        code: 'ICE-001',
        name: 'Vanilla Ice Cream',
        type: 'SERVICE',
        price: 100,
        cost: 45,
        currency: 'PHP',
        itemGroupId: itemGroups[2].id,
        isActive: true
      }
    }),
    // Room Items
    prisma.item.upsert({
      where: { code: 'ROOM001' },
      update: {},
      create: {
        code: 'ROOM001',
        name: 'Standard Room',
        type: 'SERVICE',
        price: 2500,
        cost: 800,
        currency: 'PHP',
        itemGroupId: itemGroups[3].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'ROOM002' },
      update: {},
      create: {
        code: 'ROOM002',
        name: 'Deluxe Room',
        type: 'SERVICE',
        price: 3500,
        cost: 1200,
        currency: 'PHP',
        itemGroupId: itemGroups[3].id,
        isActive: true
      }
    }),
    prisma.item.upsert({
      where: { code: 'ROOM003' },
      update: {},
      create: {
        code: 'ROOM003',
        name: 'Suite',
        type: 'SERVICE',
        price: 5500,
        cost: 1800,
        currency: 'PHP',
        itemGroupId: itemGroups[3].id,
        isActive: true
      }
    }),
  ]);

  // =================================================================
  // 7. POS TERMINALS
  // =================================================================
  console.log('💳 Creating POS Terminals...');

  const posTerminals = await Promise.all([
    prisma.pOSTerminal.create({
      data: {
        name: 'Main POS',
        businessUnitId: hotelBU.id,
        isActive: true
      }
    }),
    prisma.pOSTerminal.create({
      data: {
        name: 'Restaurant POS',
        businessUnitId: restaurantBU.id,
        isActive: true
      }
    }),
  ]);

  // =================================================================
  // 8. PAYMENT METHODS
  // =================================================================
  console.log('💳 Creating Payment Methods...');
  
  const paymentMethods = await Promise.all([
    prisma.paymentMethod.upsert({
      where: { name: 'CASH' },
      update: {},
      create: {
        name: 'CASH',
        type: 'CASH',
        isActive: true
      }
    }),
    prisma.paymentMethod.upsert({
      where: { name: 'CREDIT CARD' },
      update: {},
      create: {
        name: 'CREDIT CARD',
        type: 'CARD',
        isActive: true
      }
    }),
    prisma.paymentMethod.upsert({
      where: { name: 'DEBIT CARD' },
      update: {},
      create: {
        name: 'DEBIT CARD',
        type: 'CARD',
        isActive: true
      }
    }),
    prisma.paymentMethod.upsert({
      where: { name: 'GCASH' },
      update: {},
      create: {
        name: 'GCASH',
        type: 'DIGITAL',
        isActive: true
      }
    }),
    prisma.paymentMethod.upsert({
      where: { name: 'PAYMAYA' },
      update: {},
      create: {
        name: 'PAYMAYA',
        type: 'DIGITAL',
        isActive: true
      }
    }),
    prisma.paymentMethod.upsert({
      where: { name: 'ROOM CHARGE' },
      update: {},
      create: {
        name: 'ROOM CHARGE',
        type: 'ROOM_CHARGE',
        isActive: true
      }
    }),
  ]);

  // =================================================================
  // 9. PROMOTIONS/DISCOUNTS
  // =================================================================
  console.log('🎉 Creating Promotions...');

const promotions = await Promise.all([
  prisma.promotion.create({
    data: {
      name: 'Senior Citizen Discount',
      type: 'PERCENTAGE',
      value: 20,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true
    }
  }),
  prisma.promotion.create({
    data: {
      name: 'Student Discount',
      type: 'PERCENTAGE',
      value: 10,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true
    }
  }),
  prisma.promotion.create({
    data: {
      name: 'Happy Hour',
      type: 'PERCENTAGE',
      value: 15,
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActive: true
    }
  }),
]);

  // =================================================================
  // 10. RESTAURANT TABLES
  // =================================================================
  console.log('🍽️ Creating Restaurant Tables...');

const tables = await Promise.all([
  prisma.restaurantTable.create({
    data: {
      number: '1',
      capacity: 4,
      status: 'AVAILABLE',
      businessUnitId: restaurantBU.id,
      isActive: true
    }
  }),
  prisma.restaurantTable.create({
    data: {
      number: '2',
      capacity: 4,
      status: 'AVAILABLE',
      businessUnitId: restaurantBU.id,
      isActive: true
    }
  }),
  prisma.restaurantTable.create({
    data: {
      number: '3',
      capacity: 6,
      status: 'AVAILABLE',
      businessUnitId: restaurantBU.id,
      isActive: true
    }
  }),
  prisma.restaurantTable.create({
    data: {
      number: '4',
      capacity: 2,
      status: 'AVAILABLE',
      businessUnitId: restaurantBU.id,
      isActive: true
    }
  }),
]);

  // =================================================================
  // 11. MENUS
  // =================================================================
  console.log('📋 Creating Menus...');

const menus = await Promise.all([
  prisma.menu.create({
    data: {
      name: 'All-Day Dining Menu',
      businessUnitId: restaurantBU.id,
      isActive: true
    }
  }),
  prisma.menu.create({
    data: {
      name: 'Breakfast Menu',
      businessUnitId: hotelBU.id,
      isActive: true
    }
  }),
  prisma.menu.create({
    data: {
      name: 'Room Service Menu',
      businessUnitId: hotelBU.id,
      isActive: true
    }
  }),
]);


  // =================================================================
  // 12. MENU ITEMS (Linking menus to items)
  // =================================================================
  console.log('🔗 Linking Menu Items...');
  
  const menuItems = await Promise.all([
    // All-Day Dining Menu Items
    prisma.menuItem.upsert({
      where: { menuId_itemId: { menuId: menus[0].id, itemId: items[0].id } },
      update: {},
      create: {
        menuId: menus[0].id,
        itemId: items[0].id,
        position: 1,
        isActive: true
      }
    }),
    prisma.menuItem.upsert({
      where: { menuId_itemId: { menuId: menus[0].id, itemId: items[1].id } },
      update: {},
      create: {
        menuId: menus[0].id,
        itemId: items[1].id,
        position: 2,
        isActive: true
      }
    }),
    prisma.menuItem.upsert({
      where: { menuId_itemId: { menuId: menus[0].id, itemId: items[2].id } },
      update: {},
      create: {
        menuId: menus[0].id,
        itemId: items[2].id,
        position: 3,
        isActive: true
      }
    }),
    // Add beverages to all menus
    prisma.menuItem.upsert({
      where: { menuId_itemId: { menuId: menus[0].id, itemId: items[4].id } },
      update: {},
      create: {
        menuId: menus[0].id,
        itemId: items[4].id,
        position: 4,
        isActive: true
      }
    }),
    prisma.menuItem.upsert({
      where: { menuId_itemId: { menuId: menus[0].id, itemId: items[5].id } },
      update: {},
      create: {
        menuId: menus[0].id,
        itemId: items[5].id,
        position: 5,
        isActive: true
      }
    }),
  ]);

  console.log('✅ Comprehensive seeding completed successfully!');
  console.log(`📊 Created:
    - 3 Business Units
    - ${employees.length} Employees
    - ${users.length} Users
    - ${businessPartners.length} Business Partners
    - ${itemGroups.length} Item Groups
    - ${items.length} Items
    - ${posTerminals.length} POS Terminals
    - ${paymentMethods.length} Payment Methods
    - ${promotions.length} Promotions
    - ${tables.length} Restaurant Tables
    - ${menus.length} Menus
    - ${menuItems.length} Menu Items
  `);
  
  console.log('\n🔑 Login Credentials:');
  console.log('Admin: admin@hotel.com / admin123');
  console.log('Manager: manager@hotel.com / admin123');
  console.log('Cashier: cashier@hotel.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ An error occurred while seeding the database:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });