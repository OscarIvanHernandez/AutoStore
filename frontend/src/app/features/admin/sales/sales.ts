import { ProductoService } from './../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ItemCarrito, ProductoInterface, VentaRequest } from '../../../services/autostore.models';
import { SaleService } from '../../../services/autostore.sales-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SaleTicket } from './modal/sale-ticket/sale-ticket';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SaleTicket],
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
})
export class Sales implements OnInit {
  // Obetener los productos
  productos: ProductoInterface[] = [];

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Variable de carga
  isLoading: boolean = false;

  // Busqueda de productos
  busquedaTexto: string = '';
  productosEncontrados: any[] = [];

  // Carrito de compras
  carrito: ItemCarrito[] = [];
  subtotalGeneral: number = 0;
  totalFinal: number = 0;

  // Opciones de venta
  tipoVenta: 'CONTADO' | 'CREDITO' = 'CONTADO';
  clienteIdSeleccionado: number | null = null;
  descuento: number = 0;

  // Opciones procesar venta
  mostrarModalCobro: boolean = false;
  pasoModal: 'COBRO' | 'EXITO' ='COBRO';
  efectivoRecibido: number = 0;
  ventaRealizada: any = null;
  mostrarModalTicket: boolean = false;

  constructor(
    private productoService: ProductoService,
    private ventaService: SaleService,
    private cdr: ChangeDetectorRef

  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  private showSuccesMessage(message: string, duration: number): void {
    this.successMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    this.errorMessage = message;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.markForCheck();
    }, duration);
  }

  abrirModalCobro(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.mostrarModalCobro = true;
  }

  cerrarModalCobro(): void {
    this.mostrarModalCobro = false;
  }


  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
        this.productos = productos;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al cargar productos:', error);
        this.showErrorMessage(
          `Hubo un error al cargar los productos. (${error.status})`,
          12000
        );
      }
    });
  }

  // Buscar productos en tiempo real
  BuscarProducto(): void {
    if (this.busquedaTexto.trim().length > 1) {
      this.productoService.buscar({q: this.busquedaTexto, estado: "activo"})
        .subscribe(data => this.productosEncontrados = data);
    } else {
      this.productosEncontrados = [];
    }
  }

  // Agrega producto a carrito
  agregarAlCarrito(producto: any): void {
    const existe = this.carrito.find(item => item.productoId === producto.id);

    if (existe) {
      if (existe.cantidad < producto.stockActual) {
        existe.cantidad++;
        this.actualizarSubtotal(existe);
      } else {
        // Agregar mensaje de error
        alert('Stock máximo alcanzado para este producto.');
      }
    } else {
      const nuevoItem: ItemCarrito = {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: 1,
        precioTipo: 'MOSTRADOR',
        precioUnitario: producto.precioVentaMostrador,
        subTotal: producto.precioVentaMostrador,
        stockMaximo: producto.stockActual
      };
      this.carrito.push(nuevoItem);
    }

    // Vaciar el buscador
    this.busquedaTexto = '';
    this.productosEncontrados = [];
    this.recalcularTotales();
  }

  cambiarTipoPrecio(item: ItemCarrito, productoOriginal: any): void {
    item.precioUnitario = item.precioTipo == 'TALLER'
      ? productoOriginal.precioVentaTaller
      : productoOriginal.precioVentaMostrador;
    this.actualizarSubtotal(item);
  }

  actualizarSubtotal(item: ItemCarrito): void {
    item.subTotal = item.precioUnitario * item.cantidad;
    this.recalcularTotales();
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.recalcularTotales();
  }

  // Calculos totales
  // Método centralizado para calcular
  recalcularTotales(): void {
    this.subtotalGeneral = this.carrito.reduce((acc, item) => acc + item.subTotal, 0);
    const total = this.subtotalGeneral - this.descuento;
    this.totalFinal = total > 0 ? total : 0;
  }
  // 1. Abre el modal y valida requerimientos previos
  get cambio() {
    return this.efectivoRecibido - this.totalFinal;
  }

  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    if (this.tipoVenta === 'CREDITO' && !this.clienteIdSeleccionado) {
      alert("Debe seleccionar un cliente para ventas a crédito.");
      return;
    }

    this.efectivoRecibido = this.tipoVenta === 'CONTADO' ? this.totalFinal : 0;
    this.ventaRealizada = null;
    this.mostrarModalCobro = true;
  }

  confirmarVenta(): void {
    if (this.tipoVenta === 'CONTADO' && this.efectivoRecibido < this.totalFinal) {
      alert('El efectivo recibido debe cubrir el total de la venta.');
      return;
    }

    const payload: VentaRequest = {
      productos: this.carrito.map(item => ({
        id: item.productoId,
        cantidad: item.cantidad,
        precioTipo: item.precioTipo
      })),
      descuento: this.descuento,
      tipoVenta: this.tipoVenta,
      ...(this.tipoVenta === 'CONTADO'
        ? { efectivoRecibido: Number(this.efectivoRecibido) }
        : {}),
      ...(this.tipoVenta === 'CREDITO' && this.clienteIdSeleccionado !== null
        ? { clienteId: this.clienteIdSeleccionado }
        : {})
    };

    this.isLoading = true;
    this.ventaService.crearVenta(payload).subscribe({
      next: (ventaCreada) => {
        this.isLoading = false;
        this.ventaRealizada = ventaCreada;
        this.mostrarModalCobro = false;
        this.mostrarModalTicket = true;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        alert('Error al procesar la venta: ' + (err.error?.mensaje || err.error?.message || 'Error desconocido'));
        this.cdr.markForCheck();
      }
    });
  }

  cerrarModalTicket(): void {
    this.mostrarModalTicket = false;
    this.ventaRealizada = null;
  }

  limpiarYReiniciarPOS(): void {
    this.carrito = [];
    this.descuento = 0;
    this.tipoVenta = 'CONTADO';
    this.clienteIdSeleccionado = null;
    this.efectivoRecibido = 0;
    this.ventaRealizada = null;
    this.mostrarModalCobro = false;
    this.mostrarModalTicket = false;
    this.recalcularTotales();
  }

  // Enviar la venta
  /**procesarVenta(): void {
    if (this.carrito.length === 0) return;

    if (this.tipoVenta === 'CREDITO' && !this.clienteIdSeleccionado) {
      alert("Debe seleccionar un cliente para ventas a crédito.");
      return;
    }
    const procesarVenta: VentaRequest = {
      productos: this.carrito.map(item => ({
        id: item.productoId,
        cantidad: item.cantidad,
        precioTipo: item.precioTipo
      })),
      descuento: this.descuento,
      tipoVenta: this.tipoVenta,
      ...(this.tipoVenta === 'CREDITO' && this.clienteIdSeleccionado !== null
        ? { clienteId: this.clienteIdSeleccionado }
        : {})
    };
    console.log('PAYLOAD A ENVIAR:', procesarVenta);
    this.ventaService.crearVenta(procesarVenta).subscribe({
      next: (ventaCreada) => {
        alert('Venta Procesada con éxito');
        this.carrito = [];
        this.descuento = 0;
        this.tipoVenta = 'CONTADO';
        this.clienteIdSeleccionado = null;
        this.recalcularTotales();
      },
      error: (err) => alert('Error al procesar la venta: ' + err.error?.message)
    });
  }**/

}
