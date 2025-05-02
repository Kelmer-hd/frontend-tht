import { Tela } from "./tela.interface";

export interface MovimientoTela {
    id: number;
    telaId: number;
    areaOrigen: string;
    areaDestino: string | null;
    cantidad: number;
    fechaMovimiento: string; // formato ISO
    tipoMovimiento: string;
    referenciaDocumento: string | null;
    usuarioResponsable: string;
    estado: string;
    observaciones: string | null;
    tela?: Tela;
  }
  
  // src/app/features/telas/models/movimiento-tela-dto.interface.ts
  export interface MovimientoTelaDTO {
    telaId: number;
    areaOrigen: string;
    areaDestino: string;
    cantidad: number;
    tipoMovimiento: string;
    referenciaDocumento?: string;
    usuarioResponsable: string;
    observaciones?: string;
  }
  
  // src/app/features/telas/models/movimiento-tela-filtro.interface.ts
  export interface MovimientoTelaFiltro {
    telaId?: number;
    tipoMovimiento?: string;
    areaOrigen?: string;
    areaDestino?: string;
    fechaInicio?: string; // formato ISO
    fechaFin?: string; // formato ISO
    usuarioResponsable?: string;
    estado?: string;

}


export interface EstadisticasMovimiento {
    totalMovimientos: number;
    ultimosMovimientos: MovimientoTela[];
    movimientosPorTipo: Record<string, number>; // Ej: {'SALIDA': 10, 'ENTRADA': 5}
  }