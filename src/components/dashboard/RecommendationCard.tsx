import { AppButton } from "../ui";

interface HospitalProps {
  id: string;
  name: string;
  bloodTypeNeeded: string;
  dateLimit: string;
  urgency: "LOW" | "MEDIUM" | "CRITICAL";
  onAccept: (id: string) => void;
}

function formatDate(input: string): string {
  if (!input) {
    return "Prazo nao informado";
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function getUrgencyBadge(urgency: "LOW" | "MEDIUM" | "CRITICAL"): { label: string; className: string; icon: string } {
  if (urgency === "CRITICAL") {
    return {
      label: "Crítica",
      className: "bg-red-600 text-white",
      icon: "emergency",
    };
  }

  if (urgency === "MEDIUM") {
    return {
      label: "Média",
      className: "bg-amber-500 text-white",
      icon: "medical_services",
    };
  }

  return {
    label: "Baixa",
    className: "bg-slate-500 text-white",
    icon: "schedule",
  };
}

export function RecommendationCard({ id, name, bloodTypeNeeded, dateLimit, urgency, onAccept }: HospitalProps) {
  const badge = getUrgencyBadge(urgency);

  return (
    <div className="bg-gray-50 p-6 rounded-[2rem] space-y-4 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
           <span className="material-symbols-outlined">{badge.icon}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      <div>
        <h4 className="font-bold text-lg group-hover:text-red-600 transition-colors">{name}</h4>
        <p className="text-gray-400 text-xs">Precisa de sangue {bloodTypeNeeded}</p>
      </div>

      <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-700 border border-gray-100">
        <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Prazo limite</div>
        <div className="mt-1 font-semibold">{formatDate(dateLimit)}</div>
      </div>

      <AppButton
        variant="secondary"
        fullWidth
        onClick={() => onAccept(id)}
        className="hover:bg-red-600 hover:text-white"
      >
        Agendar Agora
      </AppButton>
    </div>
  );
}