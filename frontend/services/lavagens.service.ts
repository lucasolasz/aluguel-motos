import { apiFetch as serverFetch } from "./api";
import { apiFetch } from "@/lib/auth";
import { LavagemServico, LavagemServicoRequest } from "@/lib/types";
import { mapLavagens, type LavagemServicoDTO } from "@/lib/mappers";

export async function getLavagens(): Promise<LavagemServico[]> {
  const dtos = await serverFetch<LavagemServicoDTO[]>("/api/lavagens");
  return mapLavagens(dtos);
}

export async function adminGetLavagens(): Promise<LavagemServico[]> {
  return apiFetch<LavagemServico[]>("/api/lavagens/admin");
}

export async function adminCreateLavagem(data: LavagemServicoRequest): Promise<LavagemServico> {
  return apiFetch<LavagemServico>("/api/lavagens", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateLavagem(id: string, data: LavagemServicoRequest): Promise<LavagemServico> {
  return apiFetch<LavagemServico>(`/api/lavagens/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteLavagem(id: string): Promise<void> {
  await apiFetch<void>(`/api/lavagens/${id}`, { method: "DELETE" });
}
