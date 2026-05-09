import { apiFetch } from "./api";
import { Motorcycle } from "@/lib/types";
import { mapMotos, type MotoDTO } from "@/lib/mappers";

export async function getMotos(): Promise<Motorcycle[]> {
  const dtos = await apiFetch<MotoDTO[]>("/motos");
  return mapMotos(dtos);
}