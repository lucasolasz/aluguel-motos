import { apiFetch as serverFetch } from "./api";
import { apiFetch } from "@/lib/auth";
import { Moto, MotoRequest } from "@/lib/types";
import { mapMoto, mapMotos, type MotoDTO } from "@/lib/mappers";

export interface GetMotosParams {
  dataRetirada?: string; // YYYY-MM-DD
  dataDevolucao?: string;
}

export async function getMotos(params?: GetMotosParams): Promise<Moto[]> {
  const qs = new URLSearchParams();
  if (params?.dataRetirada) qs.set("dataRetirada", params.dataRetirada);
  if (params?.dataDevolucao) qs.set("dataDevolucao", params.dataDevolucao);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const dtos = await apiFetch<MotoDTO[]>(`/api/motos${suffix}`);
  return mapMotos(dtos);
}

export async function getMotosDestaque(): Promise<Moto[]> {
  const dtos = await apiFetch<MotoDTO[]>('/api/motos/destaque');
  return mapMotos(dtos);
}

export async function getMotoById(id: string): Promise<Moto> {
  const dto = await apiFetch<MotoDTO>(`/api/motos/${id}`);
  return mapMoto(dto);
}

export async function getMotosByCategoriaSlug(slug: string): Promise<Moto[]> {
  const motos = await getMotos();
  return motos.filter((m) => m.categoria?.slug === slug);
}

// ─── Admin ───────────────────────────────────────────────────────────

export async function adminGetMotos(): Promise<Moto[]> {
  const dtos = await apiFetch<MotoDTO[]>("/api/motos/admin");
  return mapMotos(dtos);
}

export async function adminCreateMoto(data: MotoRequest): Promise<Moto> {
  const dto = await apiFetch<MotoDTO>("/api/motos", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return mapMoto(dto);
}

export async function adminUpdateMoto(id: string, data: MotoRequest): Promise<Moto> {
  const dto = await apiFetch<MotoDTO>(`/api/motos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return mapMoto(dto);
}

export async function adminDeleteMoto(id: string): Promise<void> {
  await apiFetch<void>(`/api/motos/${id}`, { method: "DELETE" });
}
