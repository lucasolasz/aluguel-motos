"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  NIVEL_COMBUSTIVEL_LABELS,
  type CriarVistoriaPayload,
  type NivelCombustivel,
  type ReservaDetalhe,
  type TipoVistoria,
} from "@/lib/atendimento-types";
import { adminRegistrarVistoria } from "@/services/reservas.service";
import { deleteUploads, uploadVistoriaFoto } from "@/services/upload.service";
import { cn, formatBucketTimestamp } from "@/lib/utils";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ImageDialog } from "./image-dialog";

export interface CollectResult {
  payload: CriarVistoriaPayload;
  uploadedKeys: string[];
}

export interface VistoriaFormHandle {
  /** Valida campos, faz upload das fotos pendentes e devolve o payload pronto.
   *  Retorna null se a validação falhar (erros ficam inline no form).
   *  `timestamp` (ddMMyyyyHHmmss) agrupa os arquivos da retirada; se omitido, é gerado. */
  collect: (timestamp?: string) => Promise<CollectResult | null>;
}

interface VistoriaFormProps {
  reservaId: string;
  tipo: TipoVistoria;
  /** 'persist' (default): salva sozinho via botão. 'deferred': o pai persiste via ref.collect(). */
  mode?: "persist" | "deferred";
  onDone?: (d: ReservaDetalhe) => void;
  onPendingChange?: (count: number) => void;
  onCompleteChange?: (complete: boolean) => void;
}

const VistoriaForm = forwardRef<VistoriaFormHandle, VistoriaFormProps>(function VistoriaForm(
  {
    reservaId,
    tipo,
    mode = "persist",
    onDone,
    onPendingChange,
    onCompleteChange,
  },
  ref,
) {
  const [km, setKm] = useState("");
  const [nivel, setNivel] = useState<NivelCombustivel | "">("");
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<
    { file: File; previewUrl: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [kmErro, setKmErro] = useState(false);
  const [nivelErro, setNivelErro] = useState(false);
  const [fotosErro, setFotosErro] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onPendingChange?.(pendingFiles.length);
  }, [pendingFiles.length, onPendingChange]);

  useEffect(() => {
    onCompleteChange?.(!!km && !!nivel && fotos.length > 0);
  }, [km, nivel, fotos.length, onCompleteChange]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErro(null);

    const newEntries: { file: File; previewUrl: string }[] = [];
    const newUrls: string[] = [];

    Array.from(files).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      newEntries.push({ file, previewUrl });
      newUrls.push(previewUrl);
    });

    setPendingFiles((prev) => [...prev, ...newEntries]);
    setFotos((prev) => [...prev, ...newUrls]);
    setFotosErro(false);

    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFoto = (index: number) => {
    const url = fotos[index];
    const pendingIndex = pendingFiles.findIndex((pf) => pf.previewUrl === url);
    if (pendingIndex !== -1) {
      URL.revokeObjectURL(pendingFiles[pendingIndex].previewUrl);
      setPendingFiles((prev) => prev.filter((_, i) => i !== pendingIndex));
    }
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validar = (): boolean => {
    setErro(null);
    let hasErrors = false;
    if (!km)                { setKmErro(true);    hasErrors = true; }
    if (!nivel)             { setNivelErro(true); hasErrors = true; }
    if (fotos.length === 0) { setFotosErro(true); hasErrors = true; }
    return !hasErrors;
  };

  // Faz upload das fotos pendentes e monta o payload. Em falha de upload, faz rollback
  // dos objetos já enviados e devolve null. Não persiste a vistoria.
  const collect = async (timestamp?: string): Promise<CollectResult | null> => {
    if (!validar()) return null;

    const ts = timestamp ?? formatBucketTimestamp();
    let finalFotos = [...fotos];
    const uploadedKeys: string[] = [];

    if (pendingFiles.length > 0) {
      setUploading(true);
      setUploadProgress({ current: 0, total: pendingFiles.length });
      try {
        const fotosNovas: string[] = [];
        for (let i = 0; i < pendingFiles.length; i++) {
          const res = await uploadVistoriaFoto(pendingFiles[i].file, reservaId, ts);
          uploadedKeys.push(res.key);
          fotosNovas.push(res.url);
          setUploadProgress({ current: i + 1, total: pendingFiles.length });
        }

        const existingUrls = fotos.filter((u) => !u.startsWith("blob:"));
        finalFotos = [...existingUrls, ...fotosNovas];
        setFotos(finalFotos);

        pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.previewUrl));
        setPendingFiles([]);
      } catch (e) {
        // Rollback: remove do storage os uploads parciais (evita orfaos)
        await deleteUploads(uploadedKeys);
        setErro(e instanceof Error ? e.message : "Falha no upload de fotos");
        return null;
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    }

    return {
      payload: {
        tipo,
        kmRegistrado: km ? Number(km) : null,
        nivelCombustivel: nivel || null,
        observacoes: observacoes || null,
        fotos: finalFotos,
      },
      uploadedKeys,
    };
  };

  useImperativeHandle(ref, () => ({ collect }));

  const submit = async () => {
    const collected = await collect();
    if (!collected) return;

    setSaving(true);
    try {
      const d = await adminRegistrarVistoria(reservaId, collected.payload);
      onDone?.(d);
    } catch (e) {
      // Rollback: upload ok mas persistencia falhou — remove os objetos enviados (evita orfaos)
      await deleteUploads(collected.uploadedKeys);
      setErro(e instanceof Error ? e.message : "Falha ao salvar vistoria");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`km-${tipo}`}>Quilometragem (km) <span className="text-destructive">*</span></Label>
          <Input
            id={`km-${tipo}`}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={km}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setKm(value);
              setKmErro(false);
            }}
            placeholder="Ex: 12340"
            className={kmErro ? "border-destructive" : ""}
          />
          {kmErro && <p className="text-xs text-destructive">Campo obrigatório</p>}
        </div>
        <div className="space-y-2">
          <Label>Nível de combustível <span className="text-destructive">*</span></Label>
          <Select
            value={nivel}
            onValueChange={(v: NivelCombustivel) => { setNivel(v); setNivelErro(false); }}
          >
            <SelectTrigger className={nivelErro ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(NIVEL_COMBUSTIVEL_LABELS).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          {nivelErro && <p className="text-xs text-destructive">Campo obrigatório</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`obs-${tipo}`}>Observações</Label>
        <Textarea
          id={`obs-${tipo}`}
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Avarias, riscos, estado geral..."
          maxLength={2000}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Fotos da vistoria <span className="text-destructive">*</span></Label>
        <div className="flex flex-wrap gap-3">
          {fotos.map((url, i) => (
            <div
              key={url}
              className="relative h-24 w-24 overflow-hidden rounded-md border"
            >
              <ImageDialog src={url} alt={`Foto ${i + 1}`}>
                {url.startsWith("blob:") ? (
                  <img
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <Image
                    src={url}
                    alt={`Foto ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </ImageDialog>
              <button
                type="button"
                onClick={() => removeFoto(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || saving}
            className={cn(
              "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-md border text-muted-foreground hover:bg-muted",
              fotosErro ? "border-destructive" : "border-dashed"
            )}
          >
            {uploading || saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">Adicionar</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {fotosErro && <p className="text-xs text-destructive">Pelo menos 1 foto é obrigatória</p>}
      </div>

      {erro && <p className="text-sm text-destructive">{erro}</p>}

      {mode === "persist" && (
        <Button onClick={submit} disabled={saving || uploading}>
          {saving
            ? "Salvando..."
            : uploading
              ? "Enviando fotos..."
              : "Registrar vistoria"}
        </Button>
      )}

      <Dialog
        open={uploadProgress !== null}
        onOpenChange={(open) => {
          if (!open) setUploadProgress(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Enviando fotos...</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Progress
              value={
                uploadProgress
                  ? (uploadProgress.current / uploadProgress.total) * 100
                  : 0
              }
            />
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress
                ? `${uploadProgress.current} de ${uploadProgress.total}`
                : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default VistoriaForm;
