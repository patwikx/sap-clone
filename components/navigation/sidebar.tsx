'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Package,
  ShoppingCart,
  UserCheck,
  Settings,
  Building2,
  Wrench,
  Calculator,
  TrendingUp,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  {
    name: 'Business Partners',
    icon: Building2,
    children: [
      { name: 'All Partners', href: '/dashboard/business-partners' },
      { name: 'Customers', href: '/dashboard/business-partners?type=C' },
      { name: 'Suppliers', href: '/dashboard/business-partners?type=S' },
      { name: 'Leads', href: '/dashboard/business-partners?type=L' }
    ]
  },
  {
    name: 'Inventory',
    icon: Package,
    children: [
      { name: 'Items', href: '/dashboard/items' },
      { name: 'Item Groups', href: '/dashboard/item-groups' },
      { name: 'Warehouses', href: '/dashboard/warehouses' },
      { name: 'Stock Status', href: '/dashboard/stock-status' }
    ]
  },
  {
    name: 'Sales',
    icon: TrendingUp,
    children: [
      { name: 'Sales Orders', href: '/dashboard/sales-order' },
      { name: 'AR Invoices', href: '/dashboard/ar-invoices' },
      { name: 'Sales Reports', href: '/dashboard/sales-reports' }
    ]
  },
  {
    name: 'Purchasing',
    icon: ShoppingCart,
    children: [
      { name: 'Purchase Orders', href: '/dashboard/purchase-orders' },
      { name: 'AP Invoices', href: '/dashboard/ap-invoices' },
      { name: 'Purchase Reports', href: '/dashboard/purchase-reports' }
    ]
  },
  {
    name: 'Production',
    icon: Settings,
    children: [
      { name: 'Production Orders', href: '/dashboard/production-orders' },
      { name: 'Bill of Materials', href: '/dashboard/bill-of-materials' }
    ]
  },
  { name: 'Employees', href: '/dashboard/employees', icon: UserCheck },
  {
    name: 'Service',
    icon: Wrench,
    children: [
      { name: 'Service Calls', href: '/dashboard/service-calls' },
      { name: 'Equipment Cards', href: '/dashboard/equipment-cards' },
      { name: 'Service Contracts', href: '/dashboard/service-contracts' }
    ]
  },
  {
    name: 'Financials',
    icon: Calculator,
    children: [
      { name: 'Chart of Accounts', href: '/dashboard/accounts' },
      { name: 'Journal Entries', href: '/dashboard/journal-entries' },
      { name: 'Financial Reports', href: '/dashboard/financial-reports' }
    ]
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<string[]>(['Business Partners', 'Inventory'])

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">SAP Business One</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          if (item.children) {
            const isOpen = openSections.includes(item.name)
            return (
              <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-2 py-2 text-left hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    {isOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-6">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        'block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                        pathname === child.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}