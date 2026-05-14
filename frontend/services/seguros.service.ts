import { apiFetch } from "./api";
import { Seguro } from "@/lib/types";
import { mapSeguro, mapSeguros, type SeguroDTO } from "@/lib/mappers";

export async function getSeguros(): Promise<Seguro[]> {
  const dtos = await apiFetch<SeguroDTO[]>("/seguros");
  return mapSeguros(dtos);
}

export async function getSeguroById(id: string): Promise<Seguro> {
  const dto = await apiFetch<SeguroDTO>(`/seguros/${id}`);
  return mapSeguro(dto);
}

export async function getSeguroBySlug(slug: string): Promise<Seguro> {
  const dto = await apiFetch<SeguroDTO>(`/seguros/slug/${slug}`);
  return mapSeguro(dto);
}
