import { apiFetch } from "./api";
import { Category } from "@/lib/types";
import { mapCategorias, type CategoriaDTO } from "@/lib/mappers";

export async function getCategorias(): Promise<Category[]> {
  const dtos = await apiFetch<CategoriaDTO[]>("/categorias");
  return mapCategorias(dtos);
}