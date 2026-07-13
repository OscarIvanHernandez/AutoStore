export interface ProductoInterface {
  id?: number;
  nombre: string;
  marca: string;
  categoria: string;
  proveedor?: string;
  precioCompra: number;
  precioVentaMostrador: number;
  precioVentaTaller?: number;
  stockActual: number;
  stockMinimo: number;
  foto?: string;
  activo?: boolean;
}

export interface AjusteRequestInterface {
  tipo: 'ENTRADA' | 'SALIDA';
  cantida: number;
  motivo: string;

}
