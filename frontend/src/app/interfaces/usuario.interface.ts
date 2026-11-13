export interface Usuario {
  id?: number;
  nombre: string;
  correo: string;
  rol?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}