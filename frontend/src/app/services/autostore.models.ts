export interface Producto {
  id?: number;
  nombre: string;
  marca: string;
  categoria: string;
  proveedor?: string;
  precioCompra: number;
  precioVentaMostrador: number;
  precioVentaTaller: number;
  stockActual: number;
  stockMinimo: number;
  foto?: string;
  activo?: boolean;
  fechaCracion: string;
  fechaActualizacion: string;

}

export interface AjusteRequest {
  tipo: 'ENTRADA' | 'SALIDA';
  cantida: number;
  motivo: string;

}
