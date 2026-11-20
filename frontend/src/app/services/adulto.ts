import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdultoMayor } from '../interfaces/adulto.interface';

@Injectable({
  providedIn: 'root'
})
export class AdultoService {
  private apiUrl = 'http://127.0.0.1:8000/adultos';

  constructor(private http: HttpClient) { }

  // Método para obtener los headers con el Token de seguridad
  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  listarAdultos(): Observable<AdultoMayor[]> {
    return this.http.get<AdultoMayor[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  crearAdulto(adulto: AdultoMayor): Observable<AdultoMayor> {
    return this.http.post<AdultoMayor>(this.apiUrl, adulto, { headers: this.getHeaders() });
  }

  actualizarAdulto(id: number, adulto: AdultoMayor): Observable<AdultoMayor> {
    return this.http.put<AdultoMayor>(`${this.apiUrl}/${id}`, adulto, { headers: this.getHeaders() });
  }

  eliminarAdulto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
  
    obtenerVisitas(adultoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${adultoId}/visitas`, { headers: this.getHeaders() });
  }

  crearVisita(visita: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${visita.adulto_id}/visitas`, visita, { headers: this.getHeaders() });
  }

  obtenerTotalVisitas(): Observable<{total: number}> {
    return this.http.get<{total: number}>(`${this.apiUrl}/visitas/total`, { headers: this.getHeaders() });
  }
}