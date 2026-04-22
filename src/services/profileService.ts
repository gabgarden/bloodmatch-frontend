import { api } from "../api/client";

type CreateDonorPayload = {
  personId: string;
  bloodType: string;
  weight: number;
};

export async function createDonorProfile(payload: CreateDonorPayload) {
  const response = await api.post("/donors", payload);
  return response.data;
}

export async function createRequesterProfile(partyId: string) {
  const response = await api.post("/requesters", { partyId });
  return response.data;
}
