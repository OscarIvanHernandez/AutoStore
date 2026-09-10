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
  efectivoRecibido?: number | null;
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
  efectivoRecibido?: number | null;
  cambio?: number | null;
  tipoVenta: 'CONTADO' | 'CREDITO';
  clienteId?: number | null;
  estado: 'COMPLETADA' | 'CANCELADA';
  metodoPago: string;
  detalles: DetalleVentaResponse[];
}

export interface EstadoCaja {
  id?: number;
  abierta: boolean;
  fechaApertura?: string;
  efectivoInicial?: number;
  ventasEfectivo?: number;
  efectivoEsperado?: number;
}

export interface CorteCaja {
  id: number;
  fechaApertura: string;
  fechaCierre?: string | null;
  efectivoInicial: number;
  efectivoEsperado?: number | null;
  efectivoReal?: number | null;
  diferencia?: number | null;
  activo: boolean;
  usuario?: string; // Usuario sí se devuelve la relación
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  correo?: string;
  direccion?: string;
  limiteCredito: number;
  deudaActual: number;
  activo: boolean;
  fechaRegistro?: string;
}

export interface Abono {
  id: number;
  cliente?: Cliente;
  monto: number;
  fecha: string;
  saldoRestante: number;
}

export interface DeudoresStats {
  totalDeudores: number;
  sumaDeudas: number;
  deudaPromedio: number;
}

export interface Distribuidor {
  id: number;
  nombre: string;
  telefono: string;
  contacto?: string;
  activo: boolean;
}

export interface ItemCompraRequest {
  productoId: number;
  cantidad: number;
  precioUnitarioCompra: number;
}

export interface CompraRequest {
  distribuidorId: number;
  folio?: string;
  productos: ItemCompraRequest[];
}

export interface DetalleCompra {
  id: number;
  producto: { id: number; nombre: string; marca: string };
  cantidad: number;
  precioUnitarioCompra: number;
  subtotal: number;
}

export interface Compra {
  id: number;
  distribuidor: Distribuidor;
  fecha: string;
  total: number;
  folio?: string;
  detalles: DetalleCompra[];
}
