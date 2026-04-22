import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { AppButton, AppCard } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { AccessDenied } from "../components/AccessDenied";

type RequestUrgency = "Crítica" | "Média" | "Baixa";

type RequestCard = {
  id: string;
  bloodType: string;
  hospital: string;
  location: string;
  distanceKm: number;
  urgency: RequestUrgency;
  collected: number;
  target: number;
  deadline: string;
};

const requestCards: RequestCard[] = [
  {
    id: "REQ-4029",
    bloodType: "O-",
    hospital: "Hospital Central de Emergência",
    location: "Centro, São Paulo",
    distanceKm: 2.4,
    urgency: "Crítica",
    collected: 12,
    target: 20,
    deadline: "Hoje, 18:00",
  },
  {
    id: "REQ-3981",
    bloodType: "A+",
    hospital: "Instituto de Cardiologia",
    location: "Jardins, São Paulo",
    distanceKm: 5.1,
    urgency: "Média",
    collected: 8,
    target: 10,
    deadline: "Amanhã, 12:00",
  },
  {
    id: "REQ-4011",
    bloodType: "AB-",
    hospital: "Hemocentro São Lucas",
    location: "Pinheiros, São Paulo",
    distanceKm: 1.8,
    urgency: "Baixa",
    collected: 2,
    target: 15,
    deadline: "24 Abr, 17:00",
  },
  {
    id: "REQ-4055",
    bloodType: "B+",
    hospital: "Maternidade Vida Nova",
    location: "Ibirapuera, São Paulo",
    distanceKm: 8,
    urgency: "Crítica",
    collected: 1,
    target: 5,
    deadline: "Hoje, 22:00",
  },
  {
    id: "REQ-4062",
    bloodType: "O+",
    hospital: "Clínica Santa Maria",
    location: "Brooklin, São Paulo",
    distanceKm: 12.5,
    urgency: "Média",
    collected: 30,
    target: 50,
    deadline: "25 Abr, 08:00",
  },
];

function urgencyStyle(urgency: RequestUrgency) {
  if (urgency === "Crítica") {
    return {
      badge: "bg-[#ae131a] text-white",
      progress: "bg-[#ae131a]",
      sideBorder: "border-[#ae131a]",
      bloodChip: "bg-red-50 text-[#ae131a]",
    };
  }

  if (urgency === "Média") {
    return {
      badge: "bg-amber-500 text-white",
      progress: "bg-amber-500",
      sideBorder: "border-amber-500",
      bloodChip: "bg-amber-50 text-amber-700",
    };
  }

  return {
    badge: "bg-[#4c616c] text-white",
    progress: "bg-[#4c616c]",
    sideBorder: "border-[#4c616c]",
    bloodChip: "bg-slate-100 text-slate-700",
  };
}

export default function RequestsPage() {
  const { roles, logout } = useAuth();
  const [selectedBloodType, setSelectedBloodType] = useState("Todos");

  const roleSet = useMemo(() => new Set(roles), [roles]);
  const hasRequesterRole = roleSet.has("REQUESTER");
  const hasAdminRole = roleSet.has("SYSTEM_ADMIN");

  if (!hasRequesterRole && !hasAdminRole) {
    return (
      <main className="min-h-screen bg-surface p-6">
        <div className="mx-auto max-w-3xl">
          <AccessDenied title="Área de Requisições indisponível" />
        </div>
      </main>
    );
  }

  const availableBloodTypes = ["Todos", "A+", "O-", "B+", "AB-", "O+"];

  const filteredRequests =
    selectedBloodType === "Todos"
      ? requestCards
      : requestCards.filter((request) => request.bloodType === selectedBloodType);

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]">
      <DonorDashboardSidebar onLogout={logout} activeItem="requests" />
      <DonorDashboardTopbar title="Suas Requisições" onLogout={logout} />

      <main className="pt-20 px-4 pb-8 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-[1400px] space-y-6">
          <section className="rounded-3xl bg-gradient-to-r from-[#fff2f0] via-[#f9f9fb] to-[#eaf3f7] p-6 lg:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="headline-font text-3xl font-extrabold tracking-tight text-[#1a1c1d]">Suas Requisições</h1>
                <p className="mt-2 text-sm text-[#4c616c]">
                  Listagem das requisições feitas por você para os hospitais cadastrados.
                </p>
              </div>

              <Link to="/requests/new">
                <AppButton className="w-full md:w-auto" variant="danger">
                  Nova Requisição
                </AppButton>
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {availableBloodTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedBloodType(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    selectedBloodType === type
                      ? "bg-white text-[#ae131a] shadow-sm"
                      : "bg-white/60 text-[#4c616c] hover:bg-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request) => {
              const style = urgencyStyle(request.urgency);
              const progress = Math.min(100, Math.round((request.collected / request.target) * 100));

              return (
                <AppCard key={request.id} className={`border-l-4 ${style.sideBorder} p-5`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`rounded-xl px-4 py-3 ${style.bloodChip}`}>
                      <p className="headline-font text-3xl font-black">{request.bloodType}</p>
                    </div>
                    <div className="text-right">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${style.badge}`}>
                        {request.urgency}
                      </span>
                      <p className="mt-2 text-[11px] font-medium text-gray-500">Ref: #{request.id}</p>
                    </div>
                  </div>

                  <h3 className="mt-4 headline-font text-lg font-bold text-[#1a1c1d]">{request.hospital}</h3>
                  <p className="mt-1 text-xs text-gray-600">
                    {request.location} • {request.distanceKm.toFixed(1)}km
                  </p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-600">Progresso da Coleta</span>
                      <span className="text-[#1a1c1d]">
                        {request.collected} / {request.target} bolsas
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div className={`h-full rounded-full ${style.progress}`} style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Prazo limite</p>
                      <p className="text-xs font-bold text-[#1a1c1d]">{request.deadline}</p>
                    </div>

                    <button
                      type="button"
                      className="rounded-xl bg-[#f3f3f5] px-4 py-2 text-xs font-bold text-[#1a1c1d] transition-colors hover:bg-[#ae131a] hover:text-white"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </AppCard>
              );
            })}
          </section>

          {filteredRequests.length === 0 && (
            <AppCard className="p-6 text-sm text-gray-600">
              Nenhuma requisição encontrada para o tipo sanguíneo selecionado.
            </AppCard>
          )}
        </div>
      </main>
    </div>
  );
}
