import { apiFetch as serverFetch } from "./api";
import { apiFetch } from "@/lib/auth";
import { Seguro, SeguroAdmin, SeguroRequest } from "@/lib/types";
import { mapSeguro, mapSeguros, type SeguroDTO } from "@/lib/mappers";

export async function getSeguros(): Promise<Seguro[]> {
  const dtos = await serverFetch<SeguroDTO[]>("/api/seguros");
  return mapSeguros(dtos);
}

export async function getSeguroById(id: string): Promise<Seguro> {
  const dto = await serverFetch<SeguroDTO>(`/api/seguros/${id}`);
  return mapSeguro(dto);
}

export async function getSeguroBySlug(slug: string): Promise<Seguro> {
  const dto = await serverFetch<SeguroDTO>(`/api/seguros/slug/${slug}`);
  return mapSeguro(dto);
}

export async function adminGetSeguros(): Promise<SeguroAdmin[]> {
  return apiFetch<SeguroAdmin[]>("/api/seguros/admin");
}

export async function adminCreateSeguro(data: SeguroRequest): Promise<SeguroAdmin> {
  return apiFetch<SeguroAdmin>("/api/seguros", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateSeguro(id: string, data: SeguroRequest): Promise<SeguroAdmin> {
  return apiFetch<SeguroAdmin>(`/api/seguros/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteSeguro(id: string): Promise<void> {
  await apiFetch<void>(`/api/seguros/${id}`, { method: "DELETE" });
}
