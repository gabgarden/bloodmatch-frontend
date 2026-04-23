import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { AppButton, AppCard, FullPageLoading, InlineAlert } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { AccessDenied } from "../components/AccessDenied";
import { useRoleResolution } from "../hooks/useRoleResolution";
import { hasAdminRole, hasRequesterRole } from "../routes/roleRouting";
import { fetchUserDonationRequests, type UserDonationRequestCard } from "../services/donationService";

type RequestUrgency = UserDonationRequestCard["urgency"];

function extractRequestLoadErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return "Não foi possível carregar suas requisições agora.";
  }

  if (!error.response) {
    return "Falha de conexão ao carregar suas requisições. Verifique CORS e disponibilidade da API.";
  }

  const data = error.response.data;
  const apiMessage =
    (typeof data?.error === "string" && data.error.trim().length > 0 && data.error) ||
    (typeof data?.message === "string" && data.message.trim().length > 0 && data.message) ||
    null;

  if (apiMessage) {
    return apiMessage;
  }

  if (error.response.status === 401) {
    return "Sem autorização para listar requisições. Verifique se o token está válido.";
  }

  if (error.response.status === 403) {
    return "Seu perfil não possui permissão para listar requisições.";
  }

  if (error.response.status === 404) {
    return "Endpoint de requisições por usuário não encontrado no backend.";
  }

  if (error.response.status === 400) {
    return "Requisição inválida ao listar suas requisições.";
  }

  return `Erro ${error.response.status} ao carregar suas requisições.`;
}

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
  const { roles, partyId, userId, logout } = useAuth();
  const [selectedBloodType, setSelectedBloodType] = useState("Todos");
  const [requestCards, setRequestCards] = useState<UserDonationRequestCard[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const normalizedRoles = useMemo(() => roles, [roles]);
  const isResolvingRoles = useRoleResolution(normalizedRoles);
  const canAccessRequesterArea = hasRequesterRole(normalizedRoles);
  const canAccessAdminArea = hasAdminRole(normalizedRoles);

  useEffect(() => {
    if ((!partyId && !userId) || (!canAccessRequesterArea && !canAccessAdminArea)) {
      setRequestCards([]);
      return;
    }

    const currentPartyId = partyId;
    const currentUserId = userId;

    let isCancelled = false;

    async function loadRequests() {
      setIsLoadingRequests(true);
      setRequestsError(null);

      try {
        const items = await fetchUserDonationRequests({
          partyId: currentPartyId,
          userId: currentUserId,
        });

        if (!isCancelled) {
          setRequestCards(items);
        }
      } catch (error) {
        if (!isCancelled) {
          setRequestsError(extractRequestLoadErrorMessage(error));
          setRequestCards([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRequests(false);
        }
      }
    }

    loadRequests();

    return () => {
      isCancelled = true;
    };
  }, [partyId, userId, canAccessRequesterArea, canAccessAdminArea]);

  if (isResolvingRoles) {
    return <FullPageLoading message="Carregando permissões..." />;
  }

  if (!canAccessRequesterArea && !canAccessAdminArea) {
    return (
      <main className="min-h-screen bg-surface p-6">
        <div className="mx-auto max-w-3xl">
          <AccessDenied title="Área de Requisições indisponível" />
        </div>
      </main>
    );
  }

  const availableBloodTypes = useMemo(() => {
    const dynamicTypes = Array.from(
      new Set(
        requestCards
          .map((request) => request.bloodType)
          .filter((bloodType) => bloodType && bloodType !== "-"),
      ),
    ).sort();

    return ["Todos", ...dynamicTypes];
  }, [requestCards]);

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
            {isLoadingRequests && (
              <AppCard className="p-6 text-sm text-gray-600 md:col-span-2 xl:col-span-3">
                Carregando requisições...
              </AppCard>
            )}

            {requestsError && (
              <div className="md:col-span-2 xl:col-span-3">
                <InlineAlert tone="error" message={requestsError} />
              </div>
            )}

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

          {!isLoadingRequests && !requestsError && filteredRequests.length === 0 && (
            <AppCard className="p-6 text-sm text-gray-600">
              Nenhuma requisição encontrada.
            </AppCard>
          )}
        </div>
      </main>
    </div>
  );
}
