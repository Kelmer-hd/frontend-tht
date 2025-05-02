
import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthRequest, AuthResponse, User } from '../interface/auth.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Using Angular 19 signals instead of BehaviorSubject
  private currentUserSignal = signal<User | null>(null);

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem(this.USER_KEY);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Error parsing stored user', error);
        this.logout();
      }
    }
  }

  login(loginRequest: AuthRequest): Observable<AuthResponse> {
    // Aseguramos que el content-type sea application/json
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    console.log('Enviando solicitud de login a:', `${this.apiUrl}/signin`);
    console.log('Datos de login:', loginRequest);

    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, loginRequest, httpOptions)
      .pipe(
        tap(response => {
          console.log('Respuesta recibida:', response);
          this.storeToken(response.token);
          this.storeUser({
            id: response.id,
            username: response.username,
            email: response.email,
            roles: response.roles
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.roles.includes(role) : false;
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private storeUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }
}