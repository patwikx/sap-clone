import { notFound } from 'next/navigation'
import { getItemById } from '@/lib/items'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ItemForm } from '../../components/items-form'

interface EditItemPageProps {
  params: {
    id: string
  }
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const item = await getItemById(params.id)

  if (!item) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/items/${item.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
          <p className="text-gray-600 mt-2">{item.itemName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemForm initialData={item} />
        </CardContent>
      </Card>
    </div>
  )
}