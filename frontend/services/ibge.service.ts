export interface Cidade {
  id: number
  nome: string
}

export interface Bairro {
  nome: string
}

export async function getCidadesByEstado(estadoUf: string): Promise<Cidade[]> {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoUf}/municipios`,
    { next: { revalidate: 86400 } }
  )
  if (!response.ok) return []
  const data: { id: number; nome: string }[] = await response.json()
  return data.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}

export async function getBairrosByCidade(cidadeNome: string, estadoUf: string): Promise<Bairro[]> {
  const cidadeEncoded = encodeURIComponent(cidadeNome)
  const estadoEncoded = encodeURIComponent(estadoUf)
  
  const searchResponse = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/municipios?nome=${cidadeEncoded}&estado=${estadoEncoded}`,
    { next: { revalidate: 86400 } }
  )
  
  if (!searchResponse.ok) return []
  
  const municipios: { id: number; nome: string }[] = await searchResponse.json()
  
  if (municipios.length === 0) return []
  
  const municipioId = municipios[0].id
  
  const distritosResponse = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/municipios/${municipioId}/distritos`,
    { next: { revalidate: 86400 } }
  )
  
  if (!distritosResponse.ok) return []
  
  const distritos: { nome: string }[] = await distritosResponse.json()
  
  return distritos
    .map((d) => ({ nome: d.nome.replace(/^.*\/+/, '') }))
    .filter((d, idx, arr) => arr.findIndex((x) => x.nome === d.nome) === idx)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
}