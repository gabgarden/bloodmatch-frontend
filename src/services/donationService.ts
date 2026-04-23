import { api, apiOptional } from "../api/client";
import { API_BASE_URL } from "../config/api";
import { isAxiosError } from "axios";

type DonationHistoryApiItem = {
  donationId: string;
  date: string | null;
  location: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | string;
};

export type DonationHistoryEntry = {
  id: string;
  location: string;
  donationDate: string | null;
  status: string;
};

type RequestUrgency = "Crítica" | "Média" | "Baixa";

type UserDonationRequestApiItem = {
  id?: string;
  requestId?: string;
  donationRequestId?: string;
  bloodTypeNeeded?: string;
  bloodType?: string;
  hospitalName?: string;
  bloodCenterName?: string;
  bloodCenter?: string;
  location?: string;
  city?: string;
  address?: string;
  distanceKm?: number;
  distance?: number;
  urgency?: string;
  priority?: string;
  collected?: number;
  fulfilledBags?: number;
  currentAmount?: number;
  target?: number;
  requestedBags?: number;
  quantity?: number;
  dateLimit?: string | null;
  deadline?: string | null;
};

export type UserDonationRequestCard = {
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

function normalizeDonation(item: DonationHistoryApiItem, index: number): DonationHistoryEntry {
  return {
    id: item.donationId || `donation-${index}`,
    location: item.location || "Local nao informado",
    donationDate: item.date,
    status: item.status || "DESCONHECIDO",
  };
}

function normalizeRequestUrgency(value: string | undefined): RequestUrgency {
  const normalized = value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();

  if (normalized === "CRITICAL" || normalized === "CRITICA") {
    return "Crítica";
  }

  if (normalized === "MEDIUM" || normalized === "MEDIA") {
    return "Média";
  }

  return "Baixa";
}

function formatDeadline(input: string | null | undefined): string {
  if (!input || input === "null") {
    return "Sem prazo definido";
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return input;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function normalizeUserDonationRequest(item: UserDonationRequestApiItem, index: number): UserDonationRequestCard {
  const id = item.id ?? item.requestId ?? item.donationRequestId ?? `request-${index}`;
  const collected = item.collected ?? item.fulfilledBags ?? item.currentAmount ?? 0;
  const rawTarget = item.target ?? item.requestedBags ?? item.quantity ?? 0;
  const target = rawTarget > 0 ? rawTarget : Math.max(collected, 1);

  return {
    id,
    bloodType: item.bloodTypeNeeded ?? item.bloodType ?? "-",
    hospital: item.hospitalName ?? item.bloodCenterName ?? item.bloodCenter ?? "Hospital não informado",
    location: item.location ?? item.city ?? item.address ?? "Local não informado",
    distanceKm: item.distanceKm ?? item.distance ?? 0,
    urgency: normalizeRequestUrgency(item.urgency ?? item.priority),
    collected,
    target,
    deadline: formatDeadline(item.dateLimit ?? item.deadline),
  };
}

export async function fetchDonorDonationHistory(donorId: string): Promise<DonationHistoryEntry[]> {
  const response = await api.get<DonationHistoryApiItem[]>(`/donors/${donorId}/donations`);
  const items = response.data;

  return items.map(normalizeDonation);
}

function mapUserDonationRequestsResponse(
  payload: UserDonationRequestApiItem[] | { items?: UserDonationRequestApiItem[] },
): UserDonationRequestCard[] {
  const items = Array.isArray(payload) ? payload : payload.items ?? [];
  return items.map(normalizeUserDonationRequest);
}

export async function fetchUserDonationRequests(identifiers: {
  partyId?: string | null;
  userId?: string | null;
}): Promise<UserDonationRequestCard[]> {
  const partyId = identifiers.partyId?.trim();
  const userId = identifiers.userId?.trim();

  if (!partyId && !userId) {
    return [];
  }

  if (partyId) {
    try {
      const response = await apiOptional.get<UserDonationRequestApiItem[] | { items?: UserDonationRequestApiItem[] }>(
        `/users/${partyId}/donation-requests`,
      );

      return mapUserDonationRequestsResponse(response.data);
    } catch (error) {
      const shouldTryUserIdFallback =
        !!userId && userId !== partyId && isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403);

      if (!shouldTryUserIdFallback) {
        throw error;
      }
    }
  }

  if (userId) {
    const response = await apiOptional.get<UserDonationRequestApiItem[] | { items?: UserDonationRequestApiItem[] }>(
      `/users/${userId}/donation-requests`,
    );

    return mapUserDonationRequestsResponse(response.data);
  }

  return [];
}

export function buildDonationDetailsApiUrl(donationId: string): string {
  return `${API_BASE_URL}/donations/${donationId}`;
}

export const externalDonationCreatePath = "/donations/external/new";
