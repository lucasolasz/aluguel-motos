import { apiFetch } from "./api";
import { Categoria } from "@/lib/types";
import { mapCategorias, type CategoriaDTO } from "@/lib/mappers";

export async function getCategorias(): Promise<Categoria[]> {
  const dtos = await apiFetch<CategoriaDTO[]>("/categorias");
  return mapCategorias(dtos);
}