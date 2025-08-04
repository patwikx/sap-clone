import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- Clean up existing data ---
  await prisma.auditLog.deleteMany();
  await prisma.serviceCall.deleteMany();
  await prisma.serviceContract.deleteMany();
  await prisma.customerEquipmentCard.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.salesOrderLine.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.productionOrderLine.deleteMany();
  await prisma.productionOrder.deleteMany();
  await prisma.billOfMaterialsLine.deleteMany();
  await prisma.billOfMaterials.deleteMany();
  await prisma.itemWarehouse.deleteMany();
  await prisma.item.deleteMany();
  await prisma.itemGroup.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.project.deleteMany();
  await prisma.journalEntryLine.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.account.deleteMany();
  await prisma.businessPartnerAddress.deleteMany();
  await prisma.businessPartner.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  // =================================================================
  // Seed Users & Employees
  // =================================================================
  const hashedPassword = await hash('password123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });

  const mainEmployee = await prisma.employee.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      jobTitle: 'General Manager',
      email: 'john.doe@example.com',
      userId: adminUser.id,
    },
  });

  // =================================================================
  // Seed Business Partners (Customers & Suppliers)
  // =================================================================
  const customer = await prisma.businessPartner.create({
    data: {
      cardCode: 'C00001',
      cardName: 'Tech Solutions Inc.',
      cardType: 'C',
      groupCode: 1,
      balance: 1500.0,
      addresses: {
        create: [
          {
            addressName: 'Main Office',
            street: '123 Tech Park',
            city: 'Silicon Valley',
            state: 'CA',
            zipCode: '94043',
            country: 'USA',
            addressType: 'bo_BillTo',
          },
          {
            addressName: 'Warehouse',
            street: '456 Data Drive',
            city: 'Silicon Valley',
            state: 'CA',
            zipCode: '94043',
            country: 'USA',
            addressType: 'bo_ShipTo',
          },
        ],
      },
    },
  });

  const supplier = await prisma.businessPartner.create({
    data: {
      cardCode: 'V00001',
      cardName: 'Component Suppliers LLC',
      cardType: 'S',
      groupCode: 2,
    },
  });

  // =================================================================
  // Seed Financials (Chart of Accounts)
  // =================================================================
  await prisma.account.createMany({
    data: [
      { acctCode: '101000', acctName: 'Cash', acctType: 'asset' },
      { acctCode: '120000', acctName: 'Accounts Receivable', acctType: 'asset', isControlAccount: true },
      { acctCode: '140000', acctName: 'Inventory', acctType: 'asset' },
      { acctCode: '200000', acctName: 'Accounts Payable', acctType: 'liability', isControlAccount: true },
      { acctCode: '300000', acctName: 'Common Stock', acctType: 'equity' },
      { acctCode: '400000', acctName: 'Sales Revenue', acctType: 'revenue' },
      { acctCode: '500000', acctName: 'Cost of Goods Sold', acctType: 'expense' },
    ],
  });

  // =================================================================
  // Seed Inventory
  // =================================================================
  const itemGroupFinished = await prisma.itemGroup.create({ data: { groupName: 'Finished Goods' } });
  const itemGroupComponents = await prisma.itemGroup.create({ data: { groupName: 'Components' } });

  const mainWarehouse = await prisma.warehouse.create({ data: { whsCode: '01', whsName: 'Main Warehouse' } });

  const finishedGood = await prisma.item.create({
    data: {
      itemCode: 'FG001',
      itemName: 'Custom PC - Pro',
      itemType: 'I',
      price: 1200.0,
      currency: 'USD',
      procurementMethod: 'M', // Make
      itemGroupId: itemGroupFinished.id,
    },
  });

  const componentA = await prisma.item.create({
    data: {
      itemCode: 'COMP001',
      itemName: 'CPU Model X',
      itemType: 'I',
      price: 300.0,
      currency: 'USD',
      procurementMethod: 'B', // Buy
      itemGroupId: itemGroupComponents.id,
    },
  });

  const componentB = await prisma.item.create({
    data: {
      itemCode: 'COMP002',
      itemName: 'GPU Model Y',
      itemType: 'I',
      price: 450.0,
      currency: 'USD',
      procurementMethod: 'B', // Buy
      itemGroupId: itemGroupComponents.id,
    },
  });

  await prisma.itemWarehouse.createMany({
    data: [
      { itemId: componentA.id, warehouseId: mainWarehouse.id, onHand: 100 },
      { itemId: componentB.id, warehouseId: mainWarehouse.id, onHand: 50 },
      { itemId: finishedGood.id, warehouseId: mainWarehouse.id, onHand: 10 },
    ],
  });

  // =================================================================
  // Seed Production
  // =================================================================
  const bom = await prisma.billOfMaterials.create({
    data: {
      bomCode: 'BOM-FG001',
      description: 'BOM for Custom PC - Pro',
      parentItemId: finishedGood.id,
      quantity: 1,
      lines: {
        create: [
          { lineNumber: 1, childItemId: componentA.id, quantity: 1 },
          { lineNumber: 2, childItemId: componentB.id, quantity: 1 },
        ],
      },
    },
  });

  await prisma.productionOrder.create({
    data: {
      docNum: 2001,
      itemId: finishedGood.itemCode,
      plannedQty: 10,
      postingDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
    },
  });

  // =================================================================
  // Seed Sales & Purchasing Documents
  // =================================================================
  await prisma.salesOrder.create({
    data: {
      docNum: 1001,
      docDate: new Date(),
      docDueDate: new Date(),
      taxDate: new Date(),
      docTotal: 2400.0,
      businessPartnerId: customer.id,
      lines: {
        create: {
          lineNum: 1,
          itemCode: finishedGood.itemCode,
          description: 'Custom PC - Pro',
          quantity: 2,
          openQty: 2,
          price: 1200.0,
          lineTotal: 2400.0,
        },
      },
    },
  });

  await prisma.purchaseOrder.create({
    data: {
      docNum: 3001,
      docDate: new Date(),
      docDueDate: new Date(),
      taxDate: new Date(),
      docTotal: 3000.0,
      businessPartnerId: supplier.id,
      lines: {
        create: {
          lineNum: 1,
          itemCode: componentA.itemCode,
          description: 'CPU Model X',
          quantity: 10,
          openQty: 10,
          price: 300.0,
          lineTotal: 3000.0,
        },
      },
    },
  });

  // =================================================================
  // Seed Service Module
  // =================================================================
  const equipmentCard = await prisma.customerEquipmentCard.create({
    data: {
      itemCode: finishedGood.itemCode,
      itemName: finishedGood.itemName,
      serialNumber: 'SN-PRO-2024-001',
      customerId: customer.id,
    },
  });

  const serviceContract = await prisma.serviceContract.create({
    data: {
      contractName: 'Gold Support',
      customerId: customer.id,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      description: '24/7 Gold Level Support Contract',
    },
  });

  await prisma.serviceCall.create({
    data: {
      subject: 'PC not booting up',
      customerId: customer.id,
      serialNumber: equipmentCard.serialNumber,
      contractId: serviceContract.id,
      priority: 'H',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
