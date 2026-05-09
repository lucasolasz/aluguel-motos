export async function GET() {
  try {
    const res = await fetch('http://localhost:8080/api/categorias', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      return Response.json(
        { error: 'Falha ao buscar categorias' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
