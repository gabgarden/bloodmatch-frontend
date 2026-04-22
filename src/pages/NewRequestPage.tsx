import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { DonorDashboardSidebar } from "../components/dashboard/DashboardSidebar";
import { DonorDashboardTopbar } from "../components/dashboard/DashboardTopbar";
import { FullPageLoading, InlineAlert } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { CreateRequestForm } from "../components/requests/CreateRequestForm";
import { RequestPreview } from "../components/requests/RequestPreview";
import { RequestGuide } from "../components/requests/RequestGuide";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { AccessDenied } from "../components/AccessDenied";
import { useRoleResolution } from "../hooks/useRoleResolution";
import { hasAdminRole, hasRequesterRole } from "../routes/roleRouting";

export default function NewRequestPage() {
  const navigate = useNavigate();
  const { partyId, roles, logout } = useAuth();

  const isResolvingRoles = useRoleResolution(roles);
  const canAccessRequesterArea = hasRequesterRole(roles);
  const canAccessAdminArea = hasAdminRole(roles);

  const [bloodType, setBloodType] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [urgency, setUrgency] = useState<"BAIXA" | "MÉDIA" | "CRÍTICA">("CRÍTICA");
  const [hospital, setHospital] = useState("");
  const [description, setDescription] = useState("");
  const [dateLimit, setDateLimit] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (isResolvingRoles) {
    return <FullPageLoading message="Carregando permissões..." />;
  }

  if (!canAccessRequesterArea && !canAccessAdminArea) {
    return (
      <main className="min-h-screen bg-surface p-6">
        <div className="mx-auto max-w-3xl">
          <AccessDenied title="Área de Nova Requisição indisponível" />
        </div>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (!partyId) {
        throw new Error("Usuário não identificado");
      }

      const payload = {
        requesterId: partyId,
        bloodCenterId: partyId, // Using requester as blood center for now
        bloodTypeNeeded: bloodType,
        dateLimit: dateLimit,
      };

      await axios.post(`${API_BASE_URL}/donation-requests`, payload);

      setSuccessMessage("Requisição publicada com sucesso!");

      setTimeout(() => {
        navigate("/requests");
      }, 1500);
    } catch (error) {
      if (isAxiosError(error)) {
        const message =
          typeof error.response?.data?.error === "string"
            ? error.response.data.error
            : error.response?.data?.message || "Erro ao publicar requisição";
        setErrorMessage(message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Erro inesperado ao publicar requisição");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9fb] text-[#1a1c1d]">
      <DonorDashboardSidebar onLogout={logout} activeItem="new-request" />
      <DonorDashboardTopbar title="Nova Requisição" onLogout={logout} />

      <main className="pt-24 px-8 pb-16 lg:ml-64">
        <div className="max-w-5xl mx-auto">
          {successMessage && <InlineAlert tone="success" message={successMessage} className="mb-6" />}

          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-7">
              <CreateRequestForm
                bloodType={bloodType}
                onBloodTypeChange={setBloodType}
                quantity={quantity}
                onQuantityChange={setQuantity}
                urgency={urgency}
                onUrgencyChange={setUrgency}
                hospital={hospital}
                onHospitalChange={setHospital}
                description={description}
                onDescriptionChange={setDescription}
                dateLimit={dateLimit}
                onDateLimitChange={setDateLimit}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            </div>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-8">
              <RequestPreview
                bloodType={bloodType}
                quantity={quantity}
                hospital={hospital}
                urgency={urgency}
              />
              <RequestGuide />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
