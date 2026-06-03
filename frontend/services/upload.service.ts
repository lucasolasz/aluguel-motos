import { API_URL } from "@/lib/config";
import { authHeaders } from "@/lib/auth";

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export async function uploadMotoFoto(file: File, motoId: string): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("motoId", motoId);

  const res = await fetch(`${API_URL}/api/uploads/motos`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.message === "string") message = body.message;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(message);
  }

  return res.json();
}

async function uploadComReserva(
  endpoint: string,
  file: File,
  reservaId: string,
): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  form.append("reservaId", reservaId);

  const res = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: { ...authHeaders() },
    body: form,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && typeof body.message === "string") message = body.message;
    } catch {
      /* resposta sem corpo JSON */
    }
    throw new Error(message);
  }

  return res.json();
}

export async function uploadVistoriaFoto(file: File, reservaId: string): Promise<UploadResult> {
  return uploadComReserva("/api/uploads/vistorias", file, reservaId);
}

export async function uploadContratoArquivo(file: File, reservaId: string): Promise<UploadResult> {
  return uploadComReserva("/api/uploads/contratos", file, reservaId);
}

export async function deleteUpload(key: string): Promise<void> {
  await fetch(`${API_URL}/api/uploads?key=${encodeURIComponent(key)}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
}

/** Remove uploads do storage em best-effort (rollback de órfãos). Não lança. */
export async function deleteUploads(keys: string[]): Promise<void> {
  await Promise.allSettled(keys.map(deleteUpload));
}
