import { Tela } from "./tela.interface";

export interface SalidaCorte {
    id: number;
    telaId: number;
    servicioCorte: string;
    fechaSalida: string; // formato ISO 'YYYY-MM-DD'
    notaSalida: string;
    op: string;
    salidaCorte: number;
    areaDestino: string;
    estado: string;
    usuarioResponsable: string;
    fechaRegistro: string; // formato ISO
    fechaActualizacion: string | null; // formato ISO
    tela?: Tela
}

export interface SalidaCorteDTO {
    telaId: number;
    servicioCorte: string;
    fechaSalida: string; // formato ISO 'YYYY-MM-DD'
    notaSalida: string;
    op: string;
    salidaCorte: number;
    areaDestino: string;
    usuarioResponsable: string;
}

export interface SalidaCorteFiltro {
    op?: string;
    areaDestino?: string;
    fechaInicio?: string; // formato ISO 'YYYY-MM-DD'
    fechaFin?: string; // formato ISO 'YYYY-MM-DD'
}

export interface AnularDTO {
    motivo: string;
    usuario: string;
}

// src/app/features/telas/models/consumo-real-dto.interface.ts
export interface ConsumoRealDTO {
    consumoReal: number;
    observacion?: string;
    usuario: string;
}