import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { AdultoService } from '../../services/adulto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  totalAdultos: number = 0;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private adultoService: AdultoService,
    private cdRef: ChangeDetectorRef // <-- Inyectamos el actualizador
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.adultoService.listarAdultos().subscribe({
      next: (data) => {
        this.totalAdultos = data.length;
        this.cdRef.detectChanges(); // <-- Forzamos a que la pantalla se actualice con el número real
      },
      error: (err) => console.error('Error al cargar estadísticas', err)
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}