import { apiFetch } from "./api";
import { Categoria } from "@/lib/types";
import { mapCategorias, type CategoriaDTO } from "@/lib/mappers";

export async function getCategorias(): Promise<Categoria[]> {
  const dtos = await apiFetch<CategoriaDTO[]>("/categorias");
  return mapCategorias(dtos);
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}