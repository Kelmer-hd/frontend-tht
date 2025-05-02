export interface AlmacenTela {
    id: number;
    almacenId: number;
    telaId: number;
    peso: number;
    nombreAlmacen?: string;
    nombreTela?: string;
  }
  
  // Modelo para resultados de importación
  export interface ImportacionResultado {
    totalRegistros: number;
    registrosImportados: number;
    registrosFallidos: number;
    errores: string[];
  }