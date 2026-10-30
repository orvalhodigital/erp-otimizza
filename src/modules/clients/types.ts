export type ClientType = "PF" | "PJ";
export type ClientStatus = "ACTIVE" | "INACTIVE";

export interface Client {
  id: string;
  type: ClientType;
  name: string;
  tradeName?: string | null;
  document?: string | null; // Normalizado sem pontuação (11 para CPF, 14 para CNPJ)
  email?: string | null;
  phone?: string | null;
  status: ClientStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface CreateClientDTO {
  type: ClientType;
  name: string;
  tradeName?: string;
  document?: string;
  email?: string;
  phone?: string;
  notes?: string;
}
