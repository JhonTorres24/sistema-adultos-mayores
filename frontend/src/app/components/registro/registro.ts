import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  nombre = '';
  correo = '';
  password = '';
  rol = 'cuidador'; // Rol por defecto

  constructor(private authService: AuthService, private router: Router) {}

  onRegistro() {
    const nuevoUsuario = {
      nombre: this.nombre,
      correo: this.correo,
      password: this.password,
      rol: this.rol
    };

    this.authService.registro(nuevoUsuario).subscribe({
      next: (res) => {
        Swal.fire({
          title: '¡Registro Exitoso!',
          text: 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
          icon: 'success',
          confirmButtonText: 'Ir al Login',
          confirmButtonColor: '#0a2540'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: err.error.detail || 'No se pudo crear la cuenta. Verifica los datos.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33'
        });
      }
    });
  }
}