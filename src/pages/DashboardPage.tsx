import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { RecommendationCard } from "../components/dashboard/RecommendationCard";
import { useAuth } from "../context/AuthContext";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { DonorHeroSection } from "../components/dashboard/DonorHeroSection";
import { LastDonationCard } from "../components/dashboard/LastDonationCard";
import { DonationHistory } from "../components/dashboard/DonationHistory";
import { useDonorDashboard } from "../hooks/useDonorDashboard";
import { AppCard, InlineAlert } from "../components/ui";

export default function DonorDashboardPage() {
  const { roles, partyId, logout } = useAuth();

  const roleSet = useMemo(() => new Set(roles), [roles]);
  const hasDonorRole = roleSet.has("DONOR");
  const hasRequesterRole = roleSet.has("REQUESTER");
  const hasAdminRole = roleSet.has("SYSTEM_ADMIN");
  const isRequesterOnly = hasRequesterRole && !hasDonorRole && !hasAdminRole;

  // Main feature state is centralized in one hook to keep page focused on layout.
  const {
    recommendations,
    isLoadingRecommendations,
    feedback,
    errorMessage,
    displayName,
    donorBloodType,
    daysRemaining,
    livesImpacted,
    lastDonationDate,
    lastDonationHospitalName,
    hasCertificate,
    reportUrl,
    donationHistory,
    isLoadingDonationHistory,
    donationHistoryError,
    acceptDonation,
  } = useDonorDashboard({ partyId, hasDonorRole });

  if (isRequesterOnly) {
    return <Navigate to="/requests" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]">
      <DonorDashboardSidebar onLogout={logout} activeItem="donor-dashboard" />
      <DonorDashboardTopbar title="Dashboard de Doador" onLogout={logout} />

      <main className="pt-20 px-4 pb-8 lg:ml-64 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {feedback && <InlineAlert tone="success" message={feedback} />}

          {errorMessage && <InlineAlert tone="error" message={errorMessage} />}

          {roles.length === 0 && (
            <AppCard className="p-6 lg:p-8">
              <h2 className="headline-font text-2xl font-extrabold">Nenhuma funcionalidade disponível</h2>
              <p className="mt-2 text-sm text-gray-600">
                Este usuário ainda nao possui perfis ativos para acessar recursos do dashboard de doador.
              </p>
            </AppCard>
          )}

          {hasDonorRole && (
            <>
              <section className="grid grid-cols-12 gap-6">
                <DonorHeroSection
                  userName={displayName}
                  bloodType={donorBloodType}
                  daysRemaining={daysRemaining}
                  livesImpacted={livesImpacted}
                />
                <LastDonationCard
                  lastDonationDate={lastDonationDate}
                  lastDonationHospitalName={lastDonationHospitalName}
                  hasCertificate={hasCertificate}
                  reportUrl={reportUrl}
                />
              </section>

              <section className="space-y-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="headline-font text-2xl font-extrabold tracking-tight">Recomendacoes Urgentes</h2>
                    <p className="text-sm text-gray-600">Requisicoes compativeis com {donorBloodType}</p>
                  </div>
                  <button type="button" className="text-[#ae131a] font-bold flex items-center gap-1 hover:underline">
                    Ver todas <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>

                {isLoadingRecommendations && <p className="text-sm text-gray-600">Carregando recomendações...</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      id={recommendation.id}
                      name={recommendation.bloodCenterName}
                      bloodTypeNeeded={recommendation.bloodTypeNeeded}
                      dateLimit={recommendation.dateLimit}
                      urgency={recommendation.urgency}
                      onAccept={acceptDonation}
                    />
                  ))}

                  {!isLoadingRecommendations && recommendations.length === 0 && (
                    <div className="rounded-[2rem] bg-[#f3f3f5] p-6 text-sm text-gray-600 col-span-1 md:col-span-2 lg:col-span-3">
                      Nenhuma recomendação disponível no momento.
                    </div>
                  )}
                </div>

                <DonationHistory
                  items={donationHistory}
                  isLoading={isLoadingDonationHistory}
                  errorMessage={donationHistoryError}
                />
              </section>
            </>
          )}

         

          {!hasDonorRole && hasRequesterRole && !hasAdminRole && (
            <AppCard className="p-6">
              <h3 className="headline-font text-xl font-bold">Funcionalidades de requisitante</h3>
              <p className="mt-2 text-sm text-gray-600">
                As funcionalidades desta role estao disponiveis no menu lateral e nas proximas iteracoes da tela.
              </p>
            </AppCard>
          )}
        </div>
      </main>

      <button
        type="button"
        className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 h-14 w-14 lg:h-16 lg:w-16 rounded-2xl bg-[#ae131a] text-white shadow-2xl flex items-center justify-center"
      >
        <span className="material-symbols-outlined text-3xl">add_circle</span>
      </button>
    </div>
  );
}
