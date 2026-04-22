import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { TypeToggle } from "./TypeToggle";
import { AccountCredentialsFields } from "./register/AccountCredentialsFields";
import { PartyIdentityFields } from "./register/PartyIdentityFields";
import { ProfileIntentFields } from "./register/ProfileIntentFields";
import type { PartyType } from "./register/PartyIdentityFields";
import { createDonorProfile, createRequesterProfile } from "../services/profileService";
import { registerOrganization, registerPerson } from "../services/partyService";
import type { ApiResponse } from "../types/party";
import { useAuth } from "../context/AuthContext";
import { AppButton, InlineAlert } from "./ui";

type RegisterFormState = {
  name: string;
  cpf: string;
  cnpj: string;
  birthDate: string;
  email: string;
  password: string;
  confirmPassword: string;
  bloodType: string;
  weight: string;
};

function getCreatedPartyId(response: ApiResponse): string | null {
  return response.partyId ?? response.id ?? null;
}

function extractApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : "Erro ao registrar. Verifique os dados e tente novamente.";
  }

  if (!error.response) {
    return "Nao foi possivel conectar ao servidor. Verifique se a API permite acesso deste dominio (CORS).";
  }

  const data = error.response?.data;

  if (typeof data === "string" && data.trim().length > 0) {
    return data;
  }

  if (typeof data?.message === "string" && data.message.trim().length > 0) {
    return data.message;
  }

  if (typeof data?.error === "string" && data.error.trim().length > 0) {
    return data.error;
  }

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === "string") {
      return firstError;
    }

    if (typeof firstError?.message === "string") {
      return firstError.message;
    }
  }

  return "Erro ao registrar. Verifique os dados e tente novamente.";
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [type, setType] = useState<PartyType>("person");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState<RegisterFormState>({
    name: "",
    cpf: "",
    cnpj: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodType: "O+",
    weight: "",
  });

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleProfileFieldChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAccountTypeChange(nextType: PartyType) {
    setType(nextType);
  }

  async function createSelectedProfiles(partyId: string) {
    const parsedWeight = Number(form.weight);
    if (!form.bloodType || Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      throw new Error("Informe tipo sanguíneo e peso válido para criar os perfis iniciais.");
    }

    await createDonorProfile({
      personId: partyId,
      bloodType: form.bloodType,
      weight: parsedWeight,
    });

    await createRequesterProfile(partyId);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Register flow: create party, login, optionally create selected profiles, refresh login, then redirect.
    event.preventDefault();
    setErrorMessage(null);

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Senha e confirmação de senha precisam ser iguais.");
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedEmail = form.email.trim();

      const response =
        type === "person"
          ? await registerPerson({
              name: form.name.trim(),
              cpf: onlyDigits(form.cpf),
              birthDate: form.birthDate,
              email: normalizedEmail,
              password: form.password,
              passwordConfirmation: form.confirmPassword,
            })
          : await registerOrganization({
              name: form.name.trim(),
              cnpj: onlyDigits(form.cnpj),
              email: normalizedEmail,
              password: form.password,
              passwordConfirmation: form.confirmPassword,
            });

      await login({ email: normalizedEmail, password: form.password });

      const createdPartyId = getCreatedPartyId(response);
      if (type === "person") {
        if (!createdPartyId) {
          setErrorMessage("Cadastro criado, mas não foi possível identificar o partyId para criar os perfis iniciais.");
          return;
        }

        await createSelectedProfiles(createdPartyId);
        await login({ email: normalizedEmail, password: form.password });
      }

      navigate("/dashboard", { replace: true });
      return;
    } catch (error) {
      setErrorMessage(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputStyle =
    "w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none transition-all placeholder:text-gray-300 text-sm";
  const labelStyle = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  return (
    <div className="w-full">
      <TypeToggle selected={type} onChange={handleAccountTypeChange} />

      {errorMessage && (
        <InlineAlert className="mb-4" tone="error" message={errorMessage} />
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <PartyIdentityFields
          type={type}
          name={form.name}
          cpf={form.cpf}
          cnpj={form.cnpj}
          birthDate={form.birthDate}
          onChange={handleInputChange}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />

        <AccountCredentialsFields
          email={form.email}
          password={form.password}
          confirmPassword={form.confirmPassword}
          onChange={handleInputChange}
          inputStyle={inputStyle}
          labelStyle={labelStyle}
        />

        <ProfileIntentFields
          accountType={type}
          bloodType={form.bloodType}
          weight={form.weight}
          onFieldChange={handleProfileFieldChange}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
        />

        <AppButton
          type="submit"
          disabled={isSubmitting}
          fullWidth
          className="mt-1 shadow-md active:scale-[0.98]"
        >
          {isSubmitting ? "Cadastrando..." : "Finalizar Cadastro"}
        </AppButton>
      </form>
    </div>
  );
}
