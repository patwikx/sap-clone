import { Button } from '@/components/ui/button'

import { Plus } from 'lucide-react'
import { ItemGroupForm } from './components/items-group'
import { getItemGroups } from '@/lib/actions/item-groups'
import { ItemGroupsList } from './components/items-groups-list'


export default async function ItemGroupsPage() {
  const itemGroups = await getItemGroups()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Item Groups</h1>
          <p className="text-gray-600 mt-2">
            Organize your inventory items into logical groups
          </p>
        </div>
        <ItemGroupForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item Group
          </Button>
        </ItemGroupForm>
      </div>

      <ItemGroupsList itemGroups={itemGroups} />
    </div>
  )
}