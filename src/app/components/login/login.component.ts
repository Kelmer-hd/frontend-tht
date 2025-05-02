// src/app/auth/components/login/login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
    rememberMe: [false]
  });

  isSubmitting = false;
  errorMessage = '';

  constructor() {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Extrae solo username y password (elimina rememberMe)
    const { username, password } = this.loginForm.value;
    const loginData = { username, password }; // Asegura que solo se envíen estos campos

    console.log('Enviando datos de login:', loginData);

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error completo:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Usuario o contraseña inválidos';
        } else if (error.status === 500) {
          this.errorMessage = 'Error del servidor: Credenciales inválidas';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar al servidor. Por favor verifica la conexión.';
        } else {
          this.errorMessage = `Error: ${error.status} - ${error.statusText || 'Ocurrió un error desconocido'}`;
        }
      }
    });
  }

  // Getters for form controls
  get usernameControl() { return this.loginForm.get('username'); }
  get passwordControl() { return this.loginForm.get('password'); }
}