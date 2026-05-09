import { FiClock } from "react-icons/fi";
import { MdOutlineHeadphones, MdOutlineShield } from "react-icons/md";
import { RiMapPin2Line } from "react-icons/ri";

const features = [
  {
    icon: MdOutlineShield,
    title: "Segurança Total",
    description:
      "Todas as motos com seguro incluso e opções de cobertura completa.",
  },
  {
    icon: FiClock,
    title: "Reserva Rápida",
    description: "Processo de reserva simples e rápido, 100% online.",
  },
  {
    icon: RiMapPin2Line,
    title: "Retirada Flexível",
    description: "Vários pontos de retirada e devolução pela cidade.",
  },
  {
    icon: MdOutlineHeadphones,
    title: "Suporte 24h",
    description: "Assistência disponível a qualquer hora, todos os dias.",
  },
];

export function Features() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {features.map((feature) => (
          <div key={feature.title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <feature.icon className="h-6 w-6 text-foreground" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
