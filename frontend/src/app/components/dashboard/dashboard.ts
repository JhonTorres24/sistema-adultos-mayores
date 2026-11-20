import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { AdultoService } from '../../services/adulto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  // Variables para las métricas del Dashboard
  totalAdultos: number = 0;
  totalCriticos: number = 0;
  totalVisitas: number = 0; 
  listaCriticos: any[] = [];
  
  // Variables para el perfil del usuario logueado
  rolUsuario: string = 'Cuenta Activa';
  nombreUsuario: string = 'Administrador';
  correoUsuario: string = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private adultoService: AdultoService,
    private cdRef: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.obtenerDatosUsuario();
    this.cargarEstadisticas();
  }

  /**
   * Decodifica el Token JWT guardado en el localStorage para extraer 
   * el correo y el rol del usuario, y así mostrar su nombre en la pantalla.
   */
  obtenerDatosUsuario() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.correoUsuario = payload.sub;
      
      // Extraemos el nombre antes del @ y lo capitalizamos
      this.nombreUsuario = this.correoUsuario.split('@')[0];
      this.nombreUsuario = this.nombreUsuario.charAt(0).toUpperCase() + this.nombreUsuario.slice(1);

      // Asignamos el rol legible según lo que diga el Token
      if (payload.rol) {
        this.rolUsuario = payload.rol === 'admin' ? 'Administrador' : 'Cuidador';
      }
    }
  }

  /**
   * Carga los datos estadísticos para el Dashboard.
   * 1. Llama a la API para listar adultos, cuenta el total y filtra a los críticos.
   * 2. Llama a la API para contar el total de visitas del sistema.
   */
  cargarEstadisticas() {
    // 1. Cargamos los adultos mayores
    this.adultoService.listarAdultos().subscribe({
      next: (data) => {
        this.totalAdultos = data.length;
        // Filtramos a los críticos
        this.listaCriticos = data.filter(a => a.estado === 'Crítico');
        this.totalCriticos = this.listaCriticos.length;
        
        // 2. Cargamos el total de visitas
        this.adultoService.obtenerTotalVisitas().subscribe({
          next: (res) => {
            this.totalVisitas = res.total;
            this.cdRef.detectChanges(); 
          },
          error: (err) => console.error('Error al cargar visitas', err)
        });
      },
      error: (err) => console.error('Error al cargar estadísticas', err)
    });
  }

  /**
   * Cambia el tamaño de la fuente de toda la página (Función de accesibilidad).
   */
  cambiarFuente(tamanio: string) {
    document.body.style.fontSize = tamanio;
  }

  /**
   * Muestra una alerta con la información de contacto de asistencia.
   */
  llamarAsistencia() {
    Swal.fire({
      title: 'Asistencia Directa',
      text: 'Conectando con la Línea de Asistencia... Un operador del Centro de Bienestar lo atenderá en breve.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0a2540'
    });
  }

  /**
   * Simula la descarga de un reporte en PDF usando una alerta de SweetAlert2.
   */
  descargarReporte() {
    Swal.fire({
      title: 'Generando Reporte...',
      text: 'El documento PDF con la lista de adultos mayores se está descargando.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  /**
   * Cierra la sesión del usuario actual (borra el token) y lo redirige al Login.
   */
  cerrarSesion() {
    Swal.fire({
      title: '¿Cerrar Sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0a2540',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Muestra un mensaje explicando cómo agendar una visita.
   * Si el usuario acepta, lo redirige a la tabla de adultos.
   */
  programarVisita() {
    Swal.fire({
      title: 'Programar una Visita',
      text: 'Para programar una visita, ve al "Padrón Completo", busca al adulto mayor y haz clic en el botón "Historial" para registrar la fecha y el cuidador.',
      icon: 'info',
      confirmButtonText: 'Ir al Padrón',
      confirmButtonColor: '#0a2540',
      showCancelButton: true,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/adultos']);
      }
    });
  }

  /**
   * Muestra un cuadro de diálogo con los números de emergencia médica.
   */
  urgenciasMedicas() {
    Swal.fire({
      title: '🚨 Urgencias Médicas',
      html: `
        <p class="text-start">Si el adulto mayor presenta una emergencia, comuníquese inmediatamente con:</p>
        <ul class="text-start">
          <li>🚑 <b>SAMU (Ambulancia):</b> 106</li>
          <li>🏥 <b>EsSalud:</b> 411-8000</li>
          <li>📞 <b>Línea de Bienestar:</b> 0800-444-EDAD</li>
        </ul>
        <p class="small text-muted mt-2">Mantenga la calma y proporcione la dirección exacta del adulto mayor.</p>
      `,
      icon: 'warning',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#d33'
    });
  }
}