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
  cantidad: number;
  motivo: string;

}

export interface EstadoProductoInterface {
  id?: number;
  nombre: string;
  activo: boolean;
}

export interface ItemCarrito {
  productoId: number,
  nombre: string,
  cantidad: number,
  precioTipo: 'MOSTRADOR' | 'TALLER';
  precioUnitario: number,
  subTotal: number,
  stockMaximo: number;

}

export interface VentaRequest {
  productos: {
    id: number,
    cantidad: number;
    precioTipo: 'MOSTRADOR' | 'TALLER';
  }[],
  descuento: number,
  tipoVenta: 'CONTADO' | 'CREDITO'
  clienteId?: number;
}
