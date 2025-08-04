
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ServiceCallsList } from './components/service-call-list'
import { getServiceCalls } from '@/lib/actions/service-call'
import { ServiceCallForm } from './components/service-call-form'

export default async function ServiceCallsPage() {
  const serviceCalls = await getServiceCalls()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Calls</h1>
          <p className="text-gray-600 mt-2">
            Manage customer service requests and support tickets
          </p>
        </div>
        <ServiceCallForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Service Call
          </Button>
        </ServiceCallForm>
      </div>

      <ServiceCallsList serviceCalls={serviceCalls} />
    </div>
  )
}