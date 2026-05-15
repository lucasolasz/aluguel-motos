package com.ltech.backend.services;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ltech.backend.domain.dtos.CreateDocumentoDTO;
import com.ltech.backend.domain.dtos.DocumentoDTO;
import com.ltech.backend.domain.entities.Documento;
import com.ltech.backend.domain.entities.TipoDocumento;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.repositories.DocumentoRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class DocumentoService {

    private DocumentoRepository documentoRepository;

    public List<DocumentoDTO> listarMeusDocumentos(String usuarioId) {
        return documentoRepository.findByUsuarioIdOrderByCreatedAtDesc(usuarioId)
                .stream()
                .map(DocumentoDTO::from)
                .toList();
    }

    public DocumentoDTO salvarDocumento(CreateDocumentoDTO dto, Usuario usuario) {
        TipoDocumento tipo;
        try {
            tipo = TipoDocumento.valueOf(dto.tipo());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de documento inválido");
        }

        Documento documento = documentoRepository
                .findByUsuarioIdAndTipo(usuario.getId(), tipo)
                .orElse(Documento.builder()
                        .usuario(usuario)
                        .tipo(tipo)
                        .build());

        documento.setUrl(dto.url());

        return DocumentoDTO.from(documentoRepository.save(documento));
    }

    public void excluirDocumento(String documentoId, String usuarioId) {
        Documento doc = documentoRepository.findById(UUID.fromString(documentoId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Documento não encontrado"));

        if (!doc.getUsuario().getId().equals(usuarioId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão");
        }

        documentoRepository.delete(doc);
    }
}
