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
    id: number;
    cantidad: number;
    precioTipo: 'MOSTRADOR' | 'TALLER';
  }[];
  descuento: number;
  tipoVenta: 'CONTADO' | 'CREDITO';
  clienteId?: number | null;
}

export interface DetalleVentaResponse {
  id: number,
  cantidad: number,
  precioUnitario: number,
  subtotal: number,
  producto: {
    id: number,
    nombre: string,
    marca?: string,
    categoria?: string;
  }
}

export interface VentaInterface {
  id: number;
  fechaVenta: string;
  subtotal: number;
  descuento: number;
  total: number;
  tipoVenta: 'CONTADO' | 'CREDITO';
  clienteId?: number | null;
  estado: 'COMPLETADA' | 'CANCELADA';
  metodoPago: string;
  detalles: DetalleVentaResponse[];
}
