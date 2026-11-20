import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; // <-- Importamos SweetAlert

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  correo = '';
  password = '';
  error = '';
  
  verPassword: boolean = false;
  modoContraste: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.correo, this.password).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.access_token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Correo o contraseña incorrectos.';
      }
    });
  }

  togglePassword() {
    this.verPassword = !this.verPassword;
  }

  toggleContraste() {
    this.modoContraste = !this.modoContraste;
    if (this.modoContraste) {
      document.body.classList.add('alto-contraste');
    } else {
      document.body.classList.remove('alto-contraste');
    }
  }

  cambiarFuente(tamanio: string) {
    document.body.style.fontSize = tamanio;
  }

  // Nuevas funciones funcionales con SweetAlert2
  llamarAsistencia() {
    Swal.fire({
      title: 'Asistencia Directa',
      text: 'Conectando con la central de ayuda del Centro de Bienestar...',
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0a2540'
    });
  }

  llamarGratis() {
    Swal.fire({
      title: 'Llamada Gratuita',
      text: 'Marcando al 0800-444-EDAD (0800-444-3323). Por favor, manténgase en línea.',
      icon: 'success',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1b8a5a'
    });
  }
    solicitarRegistro() {
    Swal.fire({
      title: 'Solicitud de Registro',
      html: `
        <p class="text-start">Para solicitar una cuenta de beneficiario o cuidador, por favor comuníquese con la central de atención:</p>
        <ul class="text-start">
          <li>📞 Llame al: <b>0800-444-EDAD</b></li>
          <li>📧 Envíe un correo a: <b>registro@bienestar.gob.pe</b></li>
          <li>🏢 O acuda a nuestro Centro de Bienestar Local.</li>
        </ul>
        <p class="small text-muted mt-2">Un operador validará sus datos y le creará una cuenta.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#0a2540'
    });
  }
}