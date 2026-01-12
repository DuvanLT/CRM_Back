export interface RegisterDto {
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  taxId?: string;
  country?: string;

  ownerName: string;
  ownerEmail: string;
  password: string;

  // License
  licenseId?: string; // Opcional, puedes usar una licencia por defecto
}

export interface RegisterResponseDto {
  company: {
    id: string;
    name: string;
    email: string | null;
    status: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message: string;
}