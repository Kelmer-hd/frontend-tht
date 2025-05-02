import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from "rxjs";
import { ProblemDetail } from "../interface/api-response.interface";

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const toastr = inject(ToastrService);
 
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';
      
      // Verifica si la respuesta es un ProblemDetail
      if (error.error && error.error.title && error.error.detail) {
        const problemDetail = error.error as ProblemDetail;
        
        // Mensaje principal
        errorMessage = problemDetail.detail || problemDetail.title;
        
        // Si hay errores de validación, agregarlos al mensaje
        if (problemDetail.errors) {
          const validationErrors = Object.entries(problemDetail.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          
          // Mostrar errores de validación en un toast separado o anexarlos al mensaje
          if (validationErrors) {
            toastr.warning(validationErrors, 'Errores de validación');
          }
        }
      } else if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = error.error.message;
      } else {
        // Fallback al manejo anterior para compatibilidad
        switch (error.status) {
          case 400:
            errorMessage = error.error.message || 'Solicitud incorrecta';
            break;
          case 401:
            errorMessage = 'No autorizado, por favor inicie sesión';
            break;
          case 403:
            errorMessage = 'No tiene permisos para realizar esta acción';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado';
            break;
          case 500:
            errorMessage = error.error.message || 'Error interno del servidor';
            break;
          default:
            errorMessage = error.error.message || 'Error desconocido';
        }
      }
     
      toastr.error(errorMessage, 'Error');
      return throwError(() => error);
    })
  );
};