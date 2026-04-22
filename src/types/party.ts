export type CreatePersonDTO = {
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type CreateOrganizationDTO = {
  name: string;
  cnpj: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type ApiResponse = {
  id?: string;
  partyId?: string;
  type?: string;
  message?: string;
  error?: string;
};