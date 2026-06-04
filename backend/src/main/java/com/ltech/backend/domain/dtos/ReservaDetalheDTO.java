package com.ltech.backend.domain.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.ltech.backend.domain.entities.Cnh;
import com.ltech.backend.domain.entities.Contrato;
import com.ltech.backend.domain.entities.Pagamento;
import com.ltech.backend.domain.entities.Reserva;
import com.ltech.backend.domain.entities.Usuario;
import com.ltech.backend.domain.entities.Vistoria;

/**
 * Detalhe completo de uma reserva para o atendimento presencial (retirada/devolução):
 * dados da reserva + cliente + CNH + pagamentos + vistorias + contrato + flags.
 */
public record ReservaDetalheDTO(
        ReservaAdminDTO reserva,
        ClienteDetalheDTO cliente,
        CnhDetalheDTO cnh,
        Boolean cnhVerificada,
        String cnhVerificadaPor,
        LocalDateTime cnhVerificadaEm,
        LocalDateTime retiradaConcluidaEm,
        LocalDateTime devolucaoConcluidaEm,
        Integer motoKmAtual,
        List<PagamentoDTO> pagamentos,
        List<VistoriaDTO> vistorias,
        ContratoDTO contrato) {

    public record ClienteDetalheDTO(
            String id,
            String nomeCompleto,
            String email,
            String cpf,
            String ddi,
            String ddd,
            String numero) {

        public static ClienteDetalheDTO from(Usuario u) {
            return new ClienteDetalheDTO(
                    u.getId(),
                    u.getNomeCompleto(),
                    u.getUsername(),
                    u.getCpf(),
                    u.getDdi(),
                    u.getDdd(),
                    u.getNumero());
        }
    }

    public record CnhDetalheDTO(
            String rg,
            String numeroRegistro,
            String numeroCnh,
            LocalDate dataNascimento,
            LocalDate dataValidade,
            String estado,
            boolean vencida) {

        public static CnhDetalheDTO from(Cnh cnh) {
            if (cnh == null) return null;
            boolean vencida = cnh.getDataValidade() != null
                    && cnh.getDataValidade().isBefore(LocalDate.now());
            return new CnhDetalheDTO(
                    cnh.getRg(),
                    cnh.getNumeroRegistro(),
                    cnh.getNumeroCnh(),
                    cnh.getDataNascimento(),
                    cnh.getDataValidade(),
                    cnh.getEstado(),
                    vencida);
        }
    }

    public static ReservaDetalheDTO from(
            Reserva reserva,
            Cnh cnh,
            List<Pagamento> pagamentos,
            List<Vistoria> vistorias,
            Contrato contrato) {

        return new ReservaDetalheDTO(
                ReservaAdminDTO.from(reserva),
                ClienteDetalheDTO.from(reserva.getUsuario()),
                CnhDetalheDTO.from(cnh),
                reserva.getCnhVerificada(),
                reserva.getCnhVerificadaPor(),
                reserva.getCnhVerificadaEm(),
                reserva.getRetiradaConcluidaEm(),
                reserva.getDevolucaoConcluidaEm(),
                reserva.getMoto().getKmAtual(),
                pagamentos.stream().map(PagamentoDTO::from).toList(),
                vistorias.stream().map(VistoriaDTO::from).toList(),
                ContratoDTO.from(contrato));
    }
}
