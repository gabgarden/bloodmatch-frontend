import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { AccessDenied } from "../components/AccessDenied";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { RecommendationCard } from "../components/dashboard/RecommendationCard";
import { AppCard, FullPageLoading, InlineAlert } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useDonorDashboard } from "../hooks/useDonorDashboard";
import { useRoleResolution } from "../hooks/useRoleResolution";
import { hasAdminRole, hasDonorRole, hasRequesterRole } from "../routes/roleRouting";

export default function RecommendationsPage() {
  const { roles, partyId, logout } = useAuth();

  const normalizedRoles = useMemo(() => roles, [roles]);
  const isResolvingRoles = useRoleResolution(normalizedRoles);
  const canAccessDonorDashboard = hasDonorRole(normalizedRoles);
  const canAccessRequesterArea = hasRequesterRole(normalizedRoles);
  const canAccessAdminArea = hasAdminRole(normalizedRoles);
  const isRequesterOnly = canAccessRequesterArea && !canAccessDonorDashboard && !canAccessAdminArea;

  if (isResolvingRoles) {
    return <FullPageLoading message="Carregando permissões..." />;
  }

  if (isRequesterOnly) {
    return <Navigate to="/requests" replace />;
  }

  if (!canAccessDonorDashboard) {
    return (
      <main className="min-h-screen bg-surface p-6">
        <div className="mx-auto max-w-3xl">
          <AccessDenied title="Área de recomendações indisponível" />
        </div>
      </main>
    );
  }

  const {
    recommendations,
    isLoadingRecommendations,
    feedback,
    errorMessage,
    donorBloodType,
    acceptDonation,
  } = useDonorDashboard({ partyId, hasDonorRole: canAccessDonorDashboard });

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]">
      <DonorDashboardSidebar onLogout={logout} activeItem="donor-dashboard" />
      <DonorDashboardTopbar title="Todas as Recomendações" onLogout={logout} />

      <main className="pt-20 px-4 pb-8 lg:ml-64 lg:px-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {feedback && <InlineAlert tone="success" message={feedback} />}
          {errorMessage && <InlineAlert tone="error" message={errorMessage} />}

          <section className="rounded-3xl bg-gradient-to-r from-[#fff2f0] via-[#f9f9fb] to-[#eaf3f7] p-6 lg:p-8">
            <h1 className="headline-font text-3xl font-extrabold tracking-tight text-[#1a1c1d]">Todas as Recomendações</h1>
            <p className="mt-2 text-sm text-[#4c616c]">Requisições compatíveis com {donorBloodType} .</p>
          </section>

          {isLoadingRecommendations && <p className="text-sm text-gray-600">Carregando recomendações...</p>}

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <AppCard className="col-span-1 md:col-span-2 lg:col-span-3 p-6 text-sm text-gray-600">
                Nenhuma recomendação disponível no momento.
              </AppCard>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
