import { redirect } from 'next/navigation'
import { BookingLoader } from './_components/booking-loader'

interface BookingPageProps {
  params: Promise<{ step: string }>
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { step } = await params
  const stepNum = parseInt(step.replace('passo-', ''), 10)
  if (isNaN(stepNum) || stepNum < 1 || stepNum > 5) {
    redirect('/motos')
  }
  return <BookingLoader initialStep={stepNum} />
}
