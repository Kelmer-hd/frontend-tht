export enum UMDimensiones {
    LONGITUD = 'LONGITUD',
    AREA = 'AREA',
    CANTIDAD = 'CANTIDAD',
    PESO = 'PESO',
    VOLUMEN = 'VOLUMEN',
  }
  
  export interface UnidadMedida {
    id: number;
    codigo: string;
    nombre: string;
    dimension: UMDimensiones;  // Corregido para usar el enum
    ingles: string;
    abreviatura: string;
    tipo: string;
    aceptaRedondeoPorExceso: boolean;
    factorRedondeo: number;
  }
  
  export interface UnidadMedidaCreate {
    codigo: string;
    nombre: string;
    dimension: UMDimensiones;  // Corregido para usar el enum
    ingles: string;
    abreviatura: string;
    tipo: string;
    aceptaRedondeoPorExceso: boolean;
    factorRedondeo: number;
  }