import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { AccessDenied } from "../components/AccessDenied";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { AppCard, AppButton, FullPageLoading } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useRoleResolution } from "../hooks/useRoleResolution";
import { hasAdminRole, hasDonorRole, hasRequesterRole } from "../routes/roleRouting";

export default function ExternalDonationPage() {
  const { roles, logout } = useAuth();

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
          <AccessDenied title="Área de doação externa indisponível" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]">
      <DonorDashboardSidebar onLogout={logout} activeItem="external-donation" />
      <DonorDashboardTopbar title="Registrar Doação Externa" onLogout={logout} />

      <main className="pt-20 px-4 pb-8 lg:ml-64 lg:px-8">
        <div className="mx-auto max-w-[900px]">
          <AppCard className="p-8 lg:p-10">
            <h1 className="headline-font text-3xl font-extrabold tracking-tight text-[#1a1c1d]">
              Registrar Doação Externa
            </h1>
            <p className="mt-3 text-sm text-gray-600">
              imagine um formulário aqui. kkkkk
            </p>

            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-600">
         
            </div>

            <div className="mt-6">
              <AppButton disabled variant="danger">
                Formulário será habilitado com a API
              </AppButton>
            </div>
          </AppCard>
        </div>
      </main>
    </div>
  );
}
