import { PrismaClient, DocStatus } from '@prisma/client';
import { Faker, en } from '@faker-js/faker';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();
const faker = new Faker({ locale: [en] });

const USER_COUNT = 20;
const CUSTOMER_COUNT = 100;
const SUPPLIER_COUNT = 50;
const ITEM_COUNT = 200;
const DOCUMENT_COUNT = 150;

async function main() {
  console.log('Clearing existing data...');
  // Delete in reverse order of creation to avoid foreign key constraint errors
  await prisma.serviceCall.deleteMany();
  await prisma.serviceContract.deleteMany();
  await prisma.customerEquipmentCard.deleteMany();
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
  console.log('Data cleared.');

  console.log(`Seeding ${USER_COUNT} users and employees...`);
  const hashedPassword = await hash('password123', 10);
  for (let i = 0; i < USER_COUNT; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        password: hashedPassword,
      },
    });
    await prisma.employee.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        jobTitle: faker.person.jobTitle(),
        email: faker.internet.email(),
        userId: user.id,
      },
    });
  }

  console.log(`Seeding ${CUSTOMER_COUNT} customers and ${SUPPLIER_COUNT} suppliers...`);
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    await prisma.businessPartner.create({
      data: {
        cardCode: `C${String(i + 1).padStart(5, '0')}`,
        cardName: faker.company.name(),
        cardType: 'C',
        groupCode: faker.number.int({ min: 1, max: 5 }),
        balance: parseFloat(faker.finance.amount({ min: 0, max: 50000 })),
        email: faker.internet.email(),
        phone1: faker.phone.number(),
        website: faker.internet.url(),
        addresses: {
          create: {
            addressName: 'Main Office',
            street: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            zipCode: faker.location.zipCode(),
            country: 'USA',
            addressType: 'bo_BillTo',
          },
        },
      },
    });
  }
  for (let i = 0; i < SUPPLIER_COUNT; i++) {
    await prisma.businessPartner.create({
      data: {
        cardCode: `V${String(i + 1).padStart(5, '0')}`,
        cardName: faker.company.name(),
        cardType: 'S',
        groupCode: faker.number.int({ min: 1, max: 5 }),
        email: faker.internet.email(),
        phone1: faker.phone.number(),
      },
    });
  }

  console.log('Seeding chart of accounts...');
  await prisma.account.createMany({
    data: [
      { acctCode: '101000', acctName: 'Cash', acctType: 'asset' },
      { acctCode: '120000', acctName: 'Accounts Receivable', acctType: 'asset', isControlAccount: true },
      { acctCode: '140000', acctName: 'Inventory', acctType: 'asset' },
      { acctCode: '200000', acctName: 'Accounts Payable', acctType: 'liability', isControlAccount: true },
      { acctCode: '300000', acctName: 'Common Stock', acctType: 'equity' },
      { acctCode: '400000', acctName: 'Sales Revenue', acctType: 'revenue' },
      { acctCode: '500000', acctName: 'Cost of Goods Sold', acctType: 'expense' },
      { acctCode: '600000', acctName: 'Operating Expenses', acctType: 'expense' },
    ],
  });

  console.log('Seeding warehouses and item groups...');
  const warehouses = await prisma.warehouse.createManyAndReturn({
    data: [
      { whsCode: '01', whsName: 'Main Warehouse' },
      { whsCode: '02', whsName: 'Components Warehouse' },
      { whsCode: '03', whsName: 'Finished Goods Store' },
    ],
  });
  const itemGroups = await prisma.itemGroup.createManyAndReturn({
    data: [
      { groupName: 'Finished Goods' },
      { groupName: 'Sub-assemblies' },
      { groupName: 'Raw Materials' },
      { groupName: 'Services' },
    ],
  });

  console.log(`Seeding ${ITEM_COUNT} items...`);
  for (let i = 0; i < ITEM_COUNT; i++) {
    const isMake = faker.datatype.boolean(0.3); // 30% are "Make" items
    const item = await prisma.item.create({
      data: {
        itemCode: `ITM${String(i + 1).padStart(5, '0')}`,
        itemName: faker.commerce.productName(),
        itemType: 'I',
        price: parseFloat(faker.commerce.price({ min: 10, max: 2000 })),
        currency: 'USD',
        procurementMethod: isMake ? 'M' : 'B',
        itemGroupId: faker.helpers.arrayElement(itemGroups).id,
      },
    });

    // Add inventory to warehouses
    await prisma.itemWarehouse.create({
      data: {
        itemId: item.id,
        warehouseId: faker.helpers.arrayElement(warehouses).id,
        onHand: faker.number.int({ min: 0, max: 1000 }),
      },
    });
  }

  const allItems = await prisma.item.findMany();
  const makeItems = allItems.filter(i => i.procurementMethod === 'M');
  const buyItems = allItems.filter(i => i.procurementMethod === 'B');
  const allCustomers = await prisma.businessPartner.findMany({ where: { cardType: 'C' } });
  const allSuppliers = await prisma.businessPartner.findMany({ where: { cardType: 'S' } });

  console.log('Seeding Bills of Materials and Production Orders...');
  let prodOrderDocNum = 20000;
  for (const makeItem of makeItems) {
    // Create BOM
    const bom = await prisma.billOfMaterials.create({
      data: {
        bomCode: `BOM-${makeItem.itemCode}`,
        description: `BOM for ${makeItem.itemName}`,
        parentItemId: makeItem.id,
        quantity: 1,
      },
    });
    // Add components to BOM
    const numComponents = faker.number.int({ min: 2, max: 5 });
    for (let i = 0; i < numComponents; i++) {
      const component = faker.helpers.arrayElement(buyItems);
      await prisma.billOfMaterialsLine.create({
        data: {
          billOfMaterialsId: bom.id,
          lineNumber: i + 1,
          childItemId: component.id,
          quantity: faker.number.int({ min: 1, max: 4 }),
        },
      });
    }

    // Create Production Order
    await prisma.productionOrder.create({
      data: {
        docNum: prodOrderDocNum++,
        itemId: makeItem.itemCode,
        plannedQty: faker.number.int({ min: 10, max: 100 }),
        postingDate: faker.date.past(),
        dueDate: faker.date.future(),
      },
    });
  }

  console.log(`Seeding ${DOCUMENT_COUNT} sales and purchasing cycles...`);
  for (let i = 0; i < DOCUMENT_COUNT; i++) {
    // Sales Cycle
    const customer = faker.helpers.arrayElement(allCustomers);
    const salesItem = faker.helpers.arrayElement(allItems);
    const salesQty = faker.number.int({ min: 1, max: 20 });
    const salesTotal = salesItem.price * salesQty;

    await prisma.salesOrder.create({
      data: {
        docNum: 10000 + i,
        docStatus: faker.helpers.arrayElement([DocStatus.O, DocStatus.C]),
        docDate: faker.date.past(),
        docDueDate: faker.date.soon(),
        taxDate: new Date(),
        docTotal: salesTotal,
        businessPartnerId: customer.id,
        lines: {
          create: {
            lineNum: 1,
            itemCode: salesItem.itemCode,
            description: salesItem.itemName,
            quantity: salesQty,
            openQty: 0,
            price: salesItem.price,
            lineTotal: salesTotal,
          },
        },
      },
    });

    // Purchasing Cycle
    const supplier = faker.helpers.arrayElement(allSuppliers);
    const purchaseItem = faker.helpers.arrayElement(buyItems);
    const purchaseQty = faker.number.int({ min: 10, max: 200 });
    const purchaseTotal = purchaseItem.price * purchaseQty;

    await prisma.purchaseOrder.create({
      data: {
        docNum: 30000 + i,
        docStatus: faker.helpers.arrayElement([DocStatus.O, DocStatus.C]),
        docDate: faker.date.past(),
        docDueDate: faker.date.soon(),
        taxDate: new Date(),
        docTotal: purchaseTotal,
        businessPartnerId: supplier.id,
        lines: {
          create: {
            lineNum: 1,
            itemCode: purchaseItem.itemCode,
            description: purchaseItem.itemName,
            quantity: purchaseQty,
            openQty: 0,
            price: purchaseItem.price,
            lineTotal: purchaseTotal,
          },
        },
      },
    });
  }

  console.log('Seeding service module data...');
  const soldItems = faker.helpers.arrayElements(makeItems, 50);
  for (const item of soldItems) {
    const customer = faker.helpers.arrayElement(allCustomers);
    const serial = `SN-${item.itemCode}-${faker.string.alphanumeric(8).toUpperCase()}`;
    
    const equipmentCard = await prisma.customerEquipmentCard.create({
      data: {
        itemCode: item.itemCode,
        itemName: item.itemName,
        serialNumber: serial,
        customerId: customer.id,
      },
    });

    // 25% chance of having a service contract
    if (faker.datatype.boolean(0.25)) {
        const contract = await prisma.serviceContract.create({
            data: {
                contractName: `${faker.helpers.arrayElement(['Gold', 'Silver', 'Bronze'])} Support`,
                customerId: customer.id,
                startDate: faker.date.past(),
                endDate: faker.date.future(),
            }
        });
        // Create a service call for contracted customers
        await prisma.serviceCall.create({
            data: {
                subject: `Issue with ${item.itemName}`,
                customerId: customer.id,
                serialNumber: serial,
                contractId: contract.id,
                priority: faker.helpers.arrayElement(['H', 'M', 'L']),
            }
        });
    }
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
