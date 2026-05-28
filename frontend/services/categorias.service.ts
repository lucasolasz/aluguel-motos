import { apiFetch as serverFetch } from "./api";
import { apiFetch } from "@/lib/auth";
import { Categoria } from "@/lib/types";
import { mapCategorias, type CategoriaDTO } from "@/lib/mappers";

export async function getCategorias(): Promise<Categoria[]> {
  const dtos = await serverFetch<CategoriaDTO[]>("/api/categorias");
  return mapCategorias(dtos);
}

export async function getCategoriaBySlug(slug: string): Promise<Categoria | null> {
  const categorias = await getCategorias();
  return categorias.find((c) => c.slug === slug) ?? null;
}

export async function adminGetCategorias(): Promise<Categoria[]> {
  return apiFetch<Categoria[]>("/api/categorias/admin");
}

export async function adminCreateCategoria(data: Omit<Categoria, 'id'>): Promise<Categoria> {
  return apiFetch<Categoria>("/api/categorias", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateCategoria(id: string, data: Omit<Categoria, 'id'>): Promise<Categoria> {
  return apiFetch<Categoria>(`/api/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteCategoria(id: string): Promise<void> {
  await apiFetch<void>(`/api/categorias/${id}`, { method: "DELETE" });
}