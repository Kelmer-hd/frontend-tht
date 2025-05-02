import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, Observable, throwError } from "rxjs";
import { Local, LocalCreate } from "../interface/local.interface";

@Injectable({
    providedIn: 'root'
})
export class LocalService {
    private readonly apiUrl = `${environment.apiUrl}/locales`;

    constructor(private http: HttpClient) { }

    getLocales(): Observable<Local[]> {
        return this.http.get<Local[]>(this.apiUrl)
            .pipe(
                catchError(this.handleError)
            );
    }

    getLocalById(id: number): Observable<Local> {
        return this.http.get<Local>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    createLocal(local: LocalCreate): Observable<Local> {
        return this.http.post<Local>(this.apiUrl, local)
            .pipe(
                catchError(this.handleError)
            );
    }

    updateLocal(id: number, local: LocalCreate): Observable<Local> {
        return this.http.put<Local>(`${this.apiUrl}/${id}`, local)
            .pipe(
                catchError(this.handleError)
            );
    }

    deleteLocal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'Error desconocido';

        if (error.error instanceof ErrorEvent) {
            // Error del cliente
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Error del backend
            errorMessage = `Código: ${error.status}\nMensaje: ${error.error?.message || error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}