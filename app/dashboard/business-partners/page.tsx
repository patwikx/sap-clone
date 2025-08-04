
import { Button } from '@/components/ui/button'
import { getBusinessPartners } from '@/lib/business-partners'
import { Plus } from 'lucide-react'
import { BusinessPartnersList } from './components/bp-list'
import { BusinessPartnerForm } from './components/bp-form'


interface PageProps {
  searchParams: {
    type?: 'C' | 'S' | 'L'
  }
}

export default async function BusinessPartnersPage({ searchParams }: PageProps) {
  const allPartners = await getBusinessPartners()
  
  const partners = searchParams.type 
    ? allPartners.filter(partner => partner.cardType === searchParams.type)
    : allPartners

  const getTitle = () => {
    switch (searchParams.type) {
      case 'C': return 'Customers'
      case 'S': return 'Suppliers'
      case 'L': return 'Leads'
      default: return 'Business Partners'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-gray-600 mt-2">
            Manage your business relationships and partner information
          </p>
        </div>
        <BusinessPartnerForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Business Partner
          </Button>
        </BusinessPartnerForm>
      </div>

      <BusinessPartnersList partners={partners} />
    </div>
  )
}