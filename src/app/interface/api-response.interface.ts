// Interfaz para manejar ProblemDetails según RFC 7807
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  timestamp: string;
  errors?: Record<string, string>; // Para validaciones de campos
  exception?: string; // Para errores internos
}

// Mantén tu ApiResponse para respuestas exitosas
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}