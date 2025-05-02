export interface AlmacenDTO {
    id: number;
    codigoAlmacen: number;
    nombreAlmacen: string;
    abreviatura: string;
    descripcion: string;
    estado: string;
    tipoAlmacen: string;
    local: string;
  }
  
  export interface AlmacenCreateDTO {
    codigoAlmacen: number;
    nombreAlmacen: string;
    abreviatura: string;
    descripcion: string;
    estado: string;
    tipoAlmacen: string;
    local: string;
  }
  