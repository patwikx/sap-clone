import { notFound } from 'next/navigation'
import { getPOSTerminals, getCurrentShift } from '@/lib/actions/pos'
import { POSInterface } from '../../components/pos-interface'


interface POSTerminalPageProps {
  params: {
    id: string
  }
}

export default async function POSTerminalPage({ params }: POSTerminalPageProps) {
  const terminals = await getPOSTerminals()
  const terminal = terminals.find(t => t.id === params.id)

  if (!terminal) {
    notFound()
  }

  const currentShift = await getCurrentShift(terminal.id)

  return (
    <div className="h-screen bg-gray-100">
      <POSInterface terminal={terminal} currentShift={currentShift} />
    </div>
  )
}