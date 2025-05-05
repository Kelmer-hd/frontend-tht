export interface Tela {
  id: number;
  numGuia: string;
  partida: string;
  os: string;
  proveedor: string;
  fechaIngreso: string; 
  cliente: string;
  marca: string;
  op: string;
  tipoTela: string;
  descripcion: string;
  ench: string;
  cantRolloIngresado: number;
  pesoIngresado: number;
  stockReal: number;
  estado: string;
  almacen: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface TelaCreateDTO {
  numGuia: string;
  partida: string;
  os: string;
  proveedor: string;
  fechaIngreso: string;
  cliente: string;
  marca: string;
  op: string;
  tipoTela: string;
  descripcion: string;
  ench: string;
  cantRolloIngresado: number;
  pesoIngresado: number;
  // Nuevos campos
  estado: string;
  almacen: string;
}

export interface TelaFiltroDTO {
  numGuia?: string;
  proveedor?: string;
  cliente?: string;
  fechaInicio?: string;
  fechaFin?: string;
  descripcion?: string;
  os?: string;
  partida?: string;
  tipoTela: string;
  estado?: string;
  almacen?: string;
}

export interface TelaBusquedaDTO {
  termino?: string;
  campo?: string;
  ordenCampo?: string;
  ordenDir?: string;
  pagina?: number;
  tamanoPagina?: number;
}

export interface TelasPaginadas {
  datos: Tela[];
  total: number;
  pagina: number;
  tamanoPagina: number;
  totalPaginas: number;
}