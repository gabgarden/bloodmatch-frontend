import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { api } from "../api/client";
import { fetchDonorHeroSummary } from "../services/partyService";
import { fetchDonorDonationHistory, type DonationHistoryEntry } from "../services/donationService";

export type Recommendation = {
  id: string;
  bloodCenterName: string;
  bloodTypeNeeded: string;
  dateLimit: string;
  urgency: "LOW" | "MEDIUM" | "CRITICAL";
};

type RecommendationApiItem = {
  requestId?: string;
  donationRequestId?: string;
  id?: string;
  bloodTypeNeeded?: string;
  bloodType?: string;
  dateLimit?: string | null;
  bloodCenterName?: string;
  bloodCenter?: string;
  hospitalName?: string;
  urgency?: string;
};

function normalizeUrgency(value: string | undefined): "LOW" | "MEDIUM" | "CRITICAL" {
  const normalized = value?.trim().toUpperCase();

  if (normalized === "CRITICAL") {
    return "CRITICAL";
  }

  if (normalized === "MEDIUM") {
    return "MEDIUM";
  }

  return "LOW";
}

function normalizeRecommendation(item: RecommendationApiItem, index: number): Recommendation {
  const bloodCenterName = item.bloodCenterName ?? item.bloodCenter ?? item.hospitalName ?? "Hemocentro sem nome";
  const bloodTypeNeeded = item.bloodTypeNeeded ?? item.bloodType ?? "-";
  const dateLimit = item.dateLimit ?? "";

  return {
    id: item.id ?? item.requestId ?? item.donationRequestId ?? `recommendation-${index}`,
    bloodCenterName,
    bloodTypeNeeded,
    dateLimit,
    urgency: normalizeUrgency(item.urgency),
  };
}

type DonorDashboardParams = {
  partyId: string | null;
  hasDonorRole: boolean;
};

export function useDonorDashboard({ partyId, hasDonorRole }: DonorDashboardParams) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Carregando...");
  const [donorBloodType, setDonorBloodType] = useState("-");
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [livesImpacted, setLivesImpacted] = useState(0);
  const [lastDonationDate, setLastDonationDate] = useState<string | null>(null);
  const [lastDonationHospitalName, setLastDonationHospitalName] = useState<string | null>(null);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [resolvedDonorId, setResolvedDonorId] = useState<string | null>(null);
  const [donationHistory, setDonationHistory] = useState<DonationHistoryEntry[]>([]);
  const [isLoadingDonationHistory, setIsLoadingDonationHistory] = useState(false);
  const [donationHistoryError, setDonationHistoryError] = useState<string | null>(null);

  // Hero data flow: one summary endpoint hydrates all top cards.
  useEffect(() => {
    if (!partyId || !hasDonorRole) {
      setResolvedDonorId(null);
      return;
    }

    const currentPartyId = partyId;

    async function loadProfileData() {
      try {
        const summary = await fetchDonorHeroSummary(currentPartyId);

        setDisplayName(summary?.donorName?.trim() || "Seu perfil");
        setDonorBloodType(summary?.bloodType || "-");
        setDaysRemaining(typeof summary?.daysRemaining === "number" ? summary.daysRemaining : 0);
        setLivesImpacted(typeof summary?.livesImpacted === "number" ? summary.livesImpacted : 0);
        setLastDonationDate(summary?.lastDonationDate ?? null);
        setLastDonationHospitalName(summary?.lastDonationHospitalName ?? null);
        setHasCertificate(summary?.hasCertificate === true);
        setReportUrl(summary?.reportUrl ?? null);
        setResolvedDonorId(summary?.donorId ?? currentPartyId);
      } catch {
        // Keep safe fallbacks when summary is unavailable.
        setResolvedDonorId(currentPartyId);
      }
    }

    loadProfileData();
  }, [partyId, hasDonorRole]);

  useEffect(() => {
    if (!hasDonorRole || !resolvedDonorId) {
      setDonationHistory([]);
      return;
    }

    const donorId = resolvedDonorId;

    async function loadDonationHistory() {
      setIsLoadingDonationHistory(true);
      setDonationHistoryError(null);

      try {
        const history = await fetchDonorDonationHistory(donorId);
        setDonationHistory(history);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          setDonationHistoryError("Voce nao tem permissao para ver o historico de doacoes.");
        } else {
          setDonationHistoryError("Nao foi possivel carregar o historico de doacoes agora.");
        }
      } finally {
        setIsLoadingDonationHistory(false);
      }
    }

    loadDonationHistory();
  }, [hasDonorRole, resolvedDonorId]);

  // Recommendations are loaded only for donor role.
  useEffect(() => {
    if (!hasDonorRole || !partyId) {
      return;
    }

    async function loadRecommendations() {
      setIsLoadingRecommendations(true);
      setErrorMessage(null);

      try {
        const response = await api.get<RecommendationApiItem[]>("/requests/recommendations", {
          params: { donorId: partyId },
        });
        setRecommendations(response.data.map(normalizeRecommendation));
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 403) {
          setErrorMessage("Voce nao tem permissao para ver recomendacoes de doacao.");
        } else {
          setErrorMessage("Nao foi possivel carregar as recomendacoes agora.");
        }
      } finally {
        setIsLoadingRecommendations(false);
      }
    }

    loadRecommendations();
  }, [hasDonorRole, partyId]);

  async function acceptDonation(requestId: string) {
    if (!partyId) {
      return;
    }

    try {
      await api.post("/donations", { donorId: partyId, requestId });
      setFeedback("Doacao agendada com sucesso.");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage("Sem permissao para agendar doacao com sua role atual.");
      } else {
        setErrorMessage("Erro ao processar o agendamento.");
      }
    }
  }

  return {
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
  };
}
