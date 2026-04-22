import { api, apiOptional } from "../api/client";
import { isAxiosError } from "axios";
import type { ApiResponse, CreatePersonDTO, CreateOrganizationDTO } from "../types/party";

export const registerPerson = async (data: CreatePersonDTO) => {
  const response = await api.post<ApiResponse>("/parties/persons", data);
  return response.data;
};

export const registerOrganization = async (data: CreateOrganizationDTO) => {
  const response = await api.post<ApiResponse>("/parties/organizations", data);
  return response.data;
};

type PartySummaryResponse = {
  name?: string;
  fullName?: string;
  legalName?: string;
  personName?: string;
  organizationName?: string;
  partyName?: string;
  person?: { name?: string; fullName?: string };
  organization?: { name?: string; legalName?: string };
};

type DonorSummaryResponse = {
  donorId?: string;
  donorName?: string;
  bloodType?: string;
  daysRemaining?: number | null;
  livesImpacted?: number | null;
  lastDonationDate?: string | null;
  lastDonationHospitalName?: string | null;
  hasCertificate?: boolean | null;
  reportUrl?: string | null;
};

export type DonorHeroSummary = {
  donorId: string | null;
  donorName: string | null;
  bloodType: string | null;
  daysRemaining: number | null;
  livesImpacted: number | null;
  lastDonationDate: string | null;
  lastDonationHospitalName: string | null;
  hasCertificate: boolean;
  reportUrl: string | null;
};

async function tryGet<T>(url: string, params?: Record<string, string>) {
  try {
    const response = await apiOptional.get<T>(url, params ? { params } : undefined);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 400 || error.response?.status === 401 || error.response?.status === 403)) {
      return null;
    }

    throw error;
  }
}

export async function fetchPartyDisplayName(partyId: string): Promise<string | null> {
  const donorSummary = await tryGet<DonorSummaryResponse>("/donors/" + partyId + "/summary");
  if (donorSummary?.donorName && donorSummary.donorName.trim().length > 0) {
    return donorSummary.donorName;
  }

  const candidates = [
    "/persons/" + partyId + "/summary",
    "/parties/persons/" + partyId + "/summary",
    "/parties/" + partyId,
    "/parties/persons/" + partyId,
    "/parties/organizations/" + partyId,
  ];

  for (const endpoint of candidates) {
    const data = await tryGet<PartySummaryResponse>(endpoint);
    const name =
      data?.name ??
      data?.fullName ??
      data?.legalName ??
      data?.personName ??
      data?.organizationName ??
      data?.partyName ??
      data?.person?.name ??
      data?.person?.fullName ??
      data?.organization?.name ??
      data?.organization?.legalName;

    if (name && name.trim().length > 0) {
      return name;
    }
  }

  return null;
}

export async function fetchDonorBloodType(partyId: string): Promise<string | null> {
  const directCandidates = [
    "/donors/" + partyId + "/summary",
    "/donors/" + partyId,
    "/donors/persons/" + partyId,
    "/donors/by-person/" + partyId,
  ];

  for (const endpoint of directCandidates) {
    const data = await tryGet<DonorSummaryResponse>(endpoint);
    if (data?.bloodType) {
      return data.bloodType;
    }
  }

  const byQuery = await tryGet<DonorSummaryResponse | DonorSummaryResponse[]>("/donors", { personId: partyId });
  if (Array.isArray(byQuery)) {
    return byQuery[0]?.bloodType ?? null;
  }

  return byQuery?.bloodType ?? null;
}

function normalizeDonorSummary(data: DonorSummaryResponse | null): DonorHeroSummary | null {
  if (!data) {
    return null;
  }

  return {
    donorId: data.donorId ?? null,
    donorName: data.donorName ?? null,
    bloodType: data.bloodType ?? null,
    daysRemaining: typeof data.daysRemaining === "number" ? data.daysRemaining : null,
    livesImpacted: typeof data.livesImpacted === "number" ? data.livesImpacted : null,
    lastDonationDate: data.lastDonationDate ?? null,
    lastDonationHospitalName: data.lastDonationHospitalName ?? null,
    hasCertificate: data.hasCertificate === true,
    reportUrl: data.reportUrl ?? null,
  };
}

export async function fetchDonorHeroSummary(partyId: string): Promise<DonorHeroSummary | null> {
  const summaryByParty = normalizeDonorSummary(
    await tryGet<DonorSummaryResponse>("/donors/" + partyId + "/summary"),
  );

  if (summaryByParty) {
    return summaryByParty;
  }

  const donorByPerson = await tryGet<DonorSummaryResponse | DonorSummaryResponse[]>("/donors", {
    personId: partyId,
  });

  const selectedDonor = Array.isArray(donorByPerson) ? donorByPerson[0] : donorByPerson;
  const donorId = selectedDonor?.donorId;

  if (!donorId) {
    return normalizeDonorSummary(selectedDonor ?? null);
  }

  const summaryByDonorId = normalizeDonorSummary(
    await tryGet<DonorSummaryResponse>("/donors/" + donorId + "/summary"),
  );

  return summaryByDonorId ?? normalizeDonorSummary(selectedDonor ?? null);
}