import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html', 
  styleUrl: './login.css',
})
export class LoginComponent {
  correo = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.correo, this.password).subscribe({
      next: (res) => {
        this.authService.guardarToken(res.access_token);
        this.router.navigate(['/dashboard']); // Lo enviaremos al dashboard
      },
      error: (err) => {
        this.error = 'Correo o contraseña incorrectos.';
      }
    });
  }
}