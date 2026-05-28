import { apiFetch as serverFetch } from "./api";
import { apiFetch } from "@/lib/auth";
import { Acessorio, AcessorioRequest } from "@/lib/types";
import { mapAcessorio, mapAcessorios, type AcessorioDTO } from "@/lib/mappers";

export async function getAcessorios(): Promise<Acessorio[]> {
  const dtos = await serverFetch<AcessorioDTO[]>("/api/acessorios");
  return mapAcessorios(dtos);
}

export async function getAcessorioById(id: string): Promise<Acessorio> {
  const dto = await serverFetch<AcessorioDTO>(`/api/acessorios/${id}`);
  return mapAcessorio(dto);
}

export async function adminGetAcessorios(): Promise<Acessorio[]> {
  return apiFetch<Acessorio[]>("/api/acessorios/admin");
}

export async function adminCreateAcessorio(data: AcessorioRequest): Promise<Acessorio> {
  return apiFetch<Acessorio>("/api/acessorios", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateAcessorio(id: string, data: AcessorioRequest): Promise<Acessorio> {
  return apiFetch<Acessorio>(`/api/acessorios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteAcessorio(id: string): Promise<void> {
  await apiFetch<void>(`/api/acessorios/${id}`, { method: "DELETE" });
}
