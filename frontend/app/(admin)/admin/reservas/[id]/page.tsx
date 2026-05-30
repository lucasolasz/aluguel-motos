'use client'

import { useParams } from 'next/navigation'
import AtendimentoClient from './_components/atendimento-client'

export default function AtendimentoPage() {
  const { id } = useParams<{ id: string }>()
  return <AtendimentoClient id={id} />
}
