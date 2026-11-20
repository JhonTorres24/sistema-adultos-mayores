import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AdultoService } from '../../services/adulto';
import { AuthService } from '../../services/auth';
import { AdultoMayor } from '../../interfaces/adulto.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adultos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './adultos.html',
  styleUrl: './adultos.css'
})
export class AdultosComponent implements OnInit {
  // Listas de adultos
  adultos: AdultoMayor[] = [];
  adultosFiltrados: AdultoMayor[] = [];
  filtroBusqueda: string = '';
  nombreUsuario: string = 'Administrador';
  
  // Variables para las tarjetas de resumen
  adultosCriticos: number = 0;
  visitasPendientes: number = 0;

  // Control de Modales
  mostrarModalRegistro: boolean = false;
  mostrarHistorial: boolean = false;
  
  // Variables para el Historial de Visitas
  adultoSeleccionado: AdultoMayor | null = null;
  visitas: any[] = [];
  nuevaVisita = { adulto_id: 0, fecha: new Date().toISOString().split('T')[0], observaciones: '', visitado_por: '' };

  // Objeto para el formulario de registro/edición
  nuevoAdulto: AdultoMayor = {
    nombre_completo: '', edad: 0, enfermedades: '', familiar_responsable: '', telefono_contacto: '', direccion: '', estado: 'Estable'
  };

  constructor(
    private adultoService: AdultoService, 
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private authService: AuthService, 
    private router: Router
  ) {}

  /**
   * Al inicializar el componente:
   * 1. Lee el Token para mostrar el nombre del usuario.
   * 2. Carga la lista de adultos desde la base de datos.
   * 3. Escucha los parámetros de la URL (para abrir modales automáticamente).
   */
  ngOnInit() {
    // 1. Obtener el nombre del usuario desde el Token
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const correo = payload.sub; // ej: roy@ejemplo.com
      let nombre = correo.split('@')[0]; // Sacamos "roy"
      this.nombreUsuario = nombre.charAt(0).toUpperCase() + nombre.slice(1); // "Roy"
    }

    // 2. Cargar los adultos
    this.cargarAdultos();
    
    // 3. Escuchar parámetros de la URL (Redirecciones desde el menú)
    this.route.queryParams.subscribe(params => {
      if (params['abrirFormulario'] === 'true') {
        this.abrirModalRegistro(); 
      }
      
      if (params['verHistorial'] === 'true') {
        Swal.fire({
          title: 'Historial de Visitas',
          text: 'Para ver el historial, haz clic en el botón azul "Historial" del adulto mayor que deseas consultar.',
          icon: 'info',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#0a2540'
        });
      }

      if (params['verReportes'] === 'true') {
        setTimeout(() => {
          this.generarReporteSimulado();
        }, 500); 
      }
    });
  }

  /**
   * Obtiene la lista de adultos mayores desde el backend.
   * También calcula los totales para las tarjetas de resumen (críticos y visitas pendientes).
   */
  cargarAdultos() {
    this.adultoService.listarAdultos().subscribe({
      next: (data) => {
        this.adultos = data;
        this.filtrarAdultos();
        
        // Calculamos los totales para las tarjetas
        this.adultosCriticos = this.adultos.filter(a => a.estado === 'Crítico').length;
        this.visitasPendientes = this.adultos.filter(a => !a.ultima_visita_fecha || a.ultima_visita_fecha === 'Sin visitas').length;

        this.cdRef.detectChanges();

        if (this.route.snapshot.queryParams['verReportes'] === 'true') {
          this.generarReporteSimulado();
        }
      },
      error: (err) => console.error('Error al listar', err)
    });
  }

  /**
   * Filtra la lista de adultos según el texto ingresado en el buscador.
   * Busca coincidencias en el nombre del adulto o en el nombre del familiar.
   */
  filtrarAdultos() {
    if (!this.filtroBusqueda) {
      this.adultosFiltrados = [...this.adultos];
    } else {
      const busqueda = this.filtroBusqueda.toLowerCase();
      this.adultosFiltrados = this.adultos.filter(a => 
        a.nombre_completo.toLowerCase().includes(busqueda) || 
        a.familiar_responsable.toLowerCase().includes(busqueda)
      );
    }
  }

  abrirModalRegistro() {
    this.limpiarFormulario();
    this.mostrarModalRegistro = true;
  }

  cerrarModalRegistro() {
    this.mostrarModalRegistro = false;
  }

  /**
   * Guarda los datos del formulario.
   * Si el objeto tiene ID, realiza una actualización (PUT).
   * Si no tiene ID, realiza una creación (POST).
   */
  guardarAdulto() {
    if (this.nuevoAdulto.id) {
      const idParaActualizar = Number(this.nuevoAdulto.id);
      this.adultoService.actualizarAdulto(idParaActualizar, this.nuevoAdulto).subscribe({
        next: () => {
          Swal.fire('Actualizado', 'Los datos se actualizaron con éxito.', 'success');
          this.cargarAdultos();
          this.cerrarModalRegistro();
          this.limpiarFormulario();
        },
        error: () => Swal.fire('Error', 'No se pudo actualizar el registro.', 'error')
      });
    } else {
      this.adultoService.crearAdulto(this.nuevoAdulto).subscribe({
        next: () => {
          Swal.fire('Registrado', 'El adulto mayor fue registrado con éxito.', 'success');
          this.cargarAdultos();
          this.cerrarModalRegistro();
          this.limpiarFormulario();
        },
        error: () => Swal.fire('Error', 'No se pudo guardar el registro.', 'error')
      });
    }
  }

  limpiarFormulario() {
    this.nuevoAdulto = {
      nombre_completo: '', edad: 0, enfermedades: '', familiar_responsable: '', telefono_contacto: '', direccion: '', estado: 'Estable'
    };
  }

  /**
   * Carga los datos de un adulto en el formulario para poder editarlo.
   */
  editarAdulto(adulto: AdultoMayor) {
    this.nuevoAdulto = { 
      ...adulto, 
      estado: adulto.estado || 'Estable' 
    }; 
    this.mostrarModalRegistro = true; 
  }

  /**
   * Elimina un adulto mayor previa confirmación del usuario.
   */
  eliminarAdulto(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "El registro se eliminará permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#0a2540',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.adultoService.eliminarAdulto(id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El registro ha sido borrado.', 'success');
            this.cargarAdultos();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar.', 'error')
        });
      }
    });
  }

  /**
   * Abre el modal del historial de visitas y carga las visitas del adulto seleccionado.
   */
  verHistorial(adulto: AdultoMayor) {
    this.adultoSeleccionado = adulto;
    this.nuevaVisita.adulto_id = adulto.id!;
    this.mostrarHistorial = true;
    this.cargarVisitas(adulto.id!);
  }

  /**
   * Obtiene las visitas de la base de datos para un adulto específico.
   */
  cargarVisitas(adultoId: number) {
    this.visitas = []; 
    this.adultoService.obtenerVisitas(adultoId).subscribe({
      next: (data) => {
        this.visitas = data;
        this.cdRef.detectChanges(); 
      },
      error: (err) => console.error('Error al cargar visitas', err)
    });
  }

  /**
   * Registra una nueva visita en el historial del adulto mayor.
   * Valida que los campos no estén vacíos antes de enviarlos.
   */
  guardarVisita() {
    if (!this.nuevaVisita.visitado_por || !this.nuevaVisita.observaciones) {
      Swal.fire('Atención', 'Llena todos los campos de la visita.', 'info');
      return;
    }

    this.adultoService.crearVisita(this.nuevaVisita).subscribe({
      next: () => {
        Swal.fire('Visita guardada', 'La visita fue registrada correctamente.', 'success');
        this.cargarVisitas(this.nuevaVisita.adulto_id); 
        this.nuevaVisita.observaciones = ''; 
        this.nuevaVisita.visitado_por = '';
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la visita.', 'error')
    });
  }

  cerrarHistorial() {
    this.mostrarHistorial = false;
    this.adultoSeleccionado = null;
    this.visitas = [];
  }

  /**
   * Genera un resumen estadístico del padrón (Total, Estables, Pendientes, Críticos).
   * Lo muestra en una ventana de SweetAlert simulando la descarga de un PDF.
   */
  generarReporteSimulado() {
    const total = this.adultos.length;
    const criticos = this.adultos.filter(a => a.estado === 'Crítico').length;
    const pendientes = this.adultos.filter(a => a.estado === 'Pendiente').length;
    const estables = this.adultos.filter(a => a.estado === 'Estable' || !a.estado).length;

    Swal.fire({
      title: 'Generando Reporte...',
      html: `
        <div class="text-start">
          <p><strong>Padrón de Adultos Mayores</strong></p>
          <ul>
            <li>Total Registrados: <b>${total}</b></li>
            <li class="text-success">Estables: <b>${estables}</b></li>
            <li class="text-warning">Pendientes: <b>${pendientes}</b></li>
            <li class="text-danger">Críticos: <b>${criticos}</b></li>
          </ul>
          <p class="small text-muted">El documento PDF se está preparando en segundo plano...</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '<i class="bi bi-download"></i> Descargar PDF',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#0a2540',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Descarga Exitosa!',
          text: 'El reporte en PDF ha sido generado y descargado.',
          icon: 'success',
          confirmButtonColor: '#1b8a5a'
        });
      }
    });
  }

  cambiarFuente(tamanio: string) {
    document.body.style.fontSize = tamanio;
  }

  llamarAsistencia() {
    Swal.fire({
      title: 'Asistencia Directa',
      text: 'Conectando con la Línea de Asistencia... Un operador del Centro de Bienestar lo atenderá en breve.',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0a2540'
    });
  }

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

  exportarPadron() {
    Swal.fire({
      title: 'Exportando Padrón...',
      text: 'Se está generando un archivo Excel con todos los datos de los adultos mayores registrados.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  /**
   * Filtra la tabla por el nombre de un cuidador específico.
   * Muestra un SweetAlert con un <select> que contiene todos los cuidadores únicos.
   */
  filtrarPorCuidador() {
    // Creamos una lista de los familiares únicos
    const cuidadoresUnicos = [...new Set(this.adultos.map(a => a.familiar_responsable))];
    
    // Creamos las opciones para el SweetAlert
    const opcionesHTML = cuidadoresUnicos.map(c => `<option value="${c}">${c}</option>`).join('');

    Swal.fire({
      title: 'Filtrar por Cuidador',
      html: `
        <p class="text-start small mb-2">Seleccione el familiar o cuidador para ver a su cargo:</p>
        <select id="swal-select-cuidador" class="form-select mb-3">
          <option value="">Todos los cuidadores</option>
          ${opcionesHTML}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Filtrar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#0a2540',
      preConfirm: () => {
        return (document.getElementById('swal-select-cuidador') as HTMLSelectElement).value;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const cuidadorSeleccionado = result.value;
        if (!cuidadorSeleccionado) {
          this.filtroBusqueda = ''; // Si elige "Todos", limpiamos la búsqueda
        } else {
          // Buscamos por el nombre del cuidador
          this.filtroBusqueda = cuidadorSeleccionado;
        }
        this.filtrarAdultos();
      }
    });
  }
}