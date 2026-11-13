import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // <-- Agregamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdultoService } from '../../services/adulto';
import { AdultoMayor } from '../../interfaces/adulto.interface';

@Component({
  selector: 'app-adultos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './adultos.html',
  styleUrl: './adultos.css'
})
export class AdultosComponent implements OnInit {
  adultos: AdultoMayor[] = [];
  
  nuevoAdulto: AdultoMayor = {
    nombre_completo: '', edad: 0, enfermedades: '', familiar_responsable: '', telefono_contacto: '', direccion: ''
  };

  mostrarHistorial = false;
  adultoSeleccionado: AdultoMayor | null = null;
  visitas: any[] = [];
  nuevaVisita = { adulto_id: 0, fecha: new Date().toISOString().split('T')[0], observaciones: '', visitado_por: '' };

  // Inyectamos ChangeDetectorRef
  constructor(private adultoService: AdultoService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarAdultos();
  }

  cargarAdultos() {
    this.adultoService.listarAdultos().subscribe({
      next: (data) => {
        this.adultos = data;
        this.cdRef.detectChanges(); // <-- FORZAMOS A QUE LA PANTALLA SE ACTUALICE
      },
      error: (err) => console.error('Error al listar', err)
    });
  }

  guardarAdulto() {
    if (this.nuevoAdulto.id) {
      this.adultoService.actualizarAdulto(this.nuevoAdulto.id, this.nuevoAdulto).subscribe({
        next: () => { alert('Actualizado'); this.cargarAdultos(); this.limpiarFormulario(); },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.adultoService.crearAdulto(this.nuevoAdulto).subscribe({
        next: () => { alert('Registrado'); this.cargarAdultos(); this.limpiarFormulario(); },
        error: () => alert('Error al guardar')
      });
    }
  }

  limpiarFormulario() {
    this.nuevoAdulto = { nombre_completo: '', edad: 0, enfermedades: '', familiar_responsable: '', telefono_contacto: '', direccion: '' };
  }

  eliminarAdulto(id: number) {
    if (confirm('¿Eliminar registro?')) {
      this.adultoService.eliminarAdulto(id).subscribe({
        next: () => { alert('Eliminado'); this.cargarAdultos(); },
        error: () => alert('Error al eliminar')
      });
    }
  }

  editarAdulto(adulto: AdultoMayor) {
    this.nuevoAdulto = { ...adulto }; 
  }

  // --- HISTORIAL DE VISITAS ---

  verHistorial(adulto: AdultoMayor) {
    this.adultoSeleccionado = adulto;
    this.nuevaVisita.adulto_id = adulto.id!;
    this.mostrarHistorial = true;
    this.cargarVisitas(adulto.id!);
  }

  cargarVisitas(adultoId: number) {
    this.visitas = []; // Limpiamos la tabla para que no queden datos viejos
    this.adultoService.obtenerVisitas(adultoId).subscribe({
      next: (data) => {
        this.visitas = data;
        this.cdRef.detectChanges(); // <-- FORZAMOS A QUE EL MODAL SE ACTUALICE
      },
      error: (err) => console.error('Error al cargar visitas', err)
    });
  }

  guardarVisita() {
    if (!this.nuevaVisita.visitado_por || !this.nuevaVisita.observaciones) {
      alert('Llena todos los campos.');
      return;
    }

    this.adultoService.crearVisita(this.nuevaVisita).subscribe({
      next: () => {
        alert('Visita guardada');
        this.cargarVisitas(this.nuevaVisita.adulto_id); 
        this.nuevaVisita.observaciones = ''; 
        this.nuevaVisita.visitado_por = '';
      },
      error: () => alert('Error al guardar visita')
    });
  }

  cerrarHistorial() {
    this.mostrarHistorial = false;
    this.adultoSeleccionado = null;
    this.visitas = [];
  }
}