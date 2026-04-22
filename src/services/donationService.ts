import { api } from "../api/client";

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

function normalizeDonation(item: DonationHistoryApiItem, index: number): DonationHistoryEntry {
  return {
    id: item.donationId || `donation-${index}`,
    location: item.location || "Local nao informado",
    donationDate: item.date,
    status: item.status || "DESCONHECIDO",
  };
}

export async function fetchDonorDonationHistory(donorId: string): Promise<DonationHistoryEntry[]> {
  const response = await api.get<DonationHistoryApiItem[]>(`/donors/${donorId}/donations`);
  const items = response.data;

  return items.map(normalizeDonation);
}
