export interface AdultoMayor {
  id?: number;
  nombre_completo: string;
  edad: number;
  enfermedades?: string;
  familiar_responsable: string;
  telefono_contacto: string;
  direccion: string;
  estado?: string;
  ultima_visita_fecha?: string; // <-- NUEVO
  ultima_visita_por?: string;
}