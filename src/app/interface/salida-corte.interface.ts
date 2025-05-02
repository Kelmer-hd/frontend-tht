import { Tela } from "./tela.interface";

export interface SalidaCorte {
    id: number;
    telaId: number;
    servicioCorte: string;
    fechaSalida: string;
    notaSalida: string;
    op: string;
    salidaCorte: number;
    areaDestino: string;
    estado: string;
    usuarioResponsable: string;
    fechaRegistro: string; 
    fechaActualizacion: string | null; 
    tela?: Tela
}

export interface SalidaCorteDTO {
    telaId: number;
    servicioCorte: string;
    fechaSalida: string;
    notaSalida: string;
    op: string;
    salidaCorte: number;
    areaDestino: string;
    usuarioResponsable: string;
}

export interface SalidaCorteFiltro {
    op?: string;
    areaDestino?: string;
    fechaInicio?: string; 
    fechaFin?: string;
}

export interface AnularDTO {
    motivo: string;
    usuario: string;
}


export interface ConsumoRealDTO {
    consumoReal: number;
    observacion?: string;
    usuario: string;
}