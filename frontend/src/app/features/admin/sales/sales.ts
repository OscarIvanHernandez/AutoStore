import { CajaService } from './../../../services/autostore.caja-service';
import { ProductoService } from './../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Cliente, EstadoCaja, ItemCarrito, ProductoInterface, VentaRequest } from '../../../services/autostore.models';
import { SaleService } from '../../../services/autostore.sales-service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Caja } from './modal/caja/caja';
import { SaleTicket } from './modal/sale-ticket/sale-ticket';
import { ClienteService } from '../../../services/autostore.clientes-service';
import { catchError, EMPTY, of } from 'rxjs';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Caja, SaleTicket],
  templateUrl: './sales.html',
  styleUrls: ['./sales.css'],
})
export class Sales extends BaseComponent implements OnInit {
  private readonly limiteCreditoAdvertencia = 0.8;

  // Obetener los productos
  productos: ProductoInterface[] = [];

  // Variable de carga
  hasLoadedSales: boolean = false;

  // Variable de error
  hasError: boolean = false;

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

  // Clientes
  clientes: Cliente[] = [];

  // Opciones procesar venta
  mostrarModalCobro: boolean = false;
  pasoModal: 'COBRO' | 'EXITO' ='COBRO';
  efectivoRecibido: number = 0;
  ventaRealizada: any = null;
  mostrarModalTicket: boolean = false;

  // Propiedades de estado de caja
  cajaAbierta: boolean = false;
  datosCaja: EstadoCaja | null = null;
  mostrarModalApertura: boolean = false;
  mostrarModalCierre: boolean = false;

  // Variables de formularios de caja
  efectivoInicialInput: number = 0;
  efectivoRealInput: number = 0;

  constructor(
    private productoService: ProductoService,
    private ventaService: SaleService,
    private cajaService: CajaService,
    private clientesService: ClienteService,
    cdr: ChangeDetectorRef

  ) { super (cdr)}

  ngOnInit(): void {
    this.verificarEstadoCaja();
    this.cargarDatosIniciales();
  }

  abrirModalCobro(): void {
    this.successMessage = null;
    this.errorMessage = null;
    this.mostrarModalCobro = true;
  }

  cerrarModalCobro(): void {
    this.mostrarModalCobro = false;
  }

  cambiarTipoVenta(tipo: 'CONTADO' | 'CREDITO'): void {
    if (tipo === 'CREDITO') {
      this.cargarClientes();
      return;
    }

    this.clienteIdSeleccionado = null;
  }
  cargarDatosIniciales(): void {
    //Productos
    this.cargarProductos();
    // Clientes
    this.cargarClientes();
  }
  cargarClientes(): void {
    this.isLoading = true;
    this.cargarRecurso('clientes', this.clientesService.listarClientes(), (data) =>{
      this.clientes = data;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
    });
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.cargarRecurso('productos', this.productoService.getProductos(), (data) => {
      this.productos = data;
      this.isLoading = false;
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
    });
  }

  verificarEstadoCaja(): void {
    this.isLoading = true;
    this.cargarRecurso('verificarCaja', this.cajaService.obtenerEstado(), (data) => {
      this.datosCaja = data;
      this.cajaAbierta = data.abierta;
      this.isLoading = false;
      if (!this.cajaAbierta) {
        this.mostrarModalApertura = true; // Bloquea la pantalla hasta abrir
      };
    });
  }

  confirmarApertura(): void {
    this.onAbrirCaja(this.efectivoInicialInput);
  }

  abrirModalApertura(): void {
    this.mostrarModalApertura = true;
  }

  confirmarCierre(): void {
    this.onCerrarCaja(this.efectivoRealInput);
  }

  onAbrirCaja(efectivoInicial: number): void {
    this.ejecutarMutacion(this.cajaService.abrirCaja(efectivoInicial),'abrir caja', () => {
        this.mostrarModalApertura = false;
        this.isLoading = false;
        this.verificarEstadoCaja();
    });
  }

  onCerrarCaja(efectivoReal: number): void {
    this.ejecutarMutacion(this.cajaService.cerrarCaja(efectivoReal), 'cerrar caja', () => {
      this.mostrarModalCierre = false;
      this.verificarEstadoCaja();
    });
  }

  // Buscar productos en tiempo real
  BuscarProducto(): void {
    if (this.busquedaTexto.trim().length > 1) {
      this.isLoading = true;
      this.cargarRecurso('buscarProducto', this.productoService.buscar({
        q: this.busquedaTexto,
        estado: "activo"
      }), (data) => {
          this.productosEncontrados = data
          this.isLoading = false;
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 500);
      });
    };
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

  get clienteSeleccionado(): Cliente | undefined {
    return this.clientes.find(cliente => cliente.id === this.clienteIdSeleccionado);
  }

  get deudaProyectada(): number {
    const cliente = this.clienteSeleccionado;
    if (this.tipoVenta !== 'CREDITO' || !cliente) return 0;

    const pagoInicial = Math.max(0, Number(this.efectivoRecibido) || 0);
    const deudaVenta = Math.max(0, this.totalFinal - pagoInicial);
    return cliente.deudaActual + deudaVenta;
  }

  get creditoExcedeLimite(): boolean {
    const cliente = this.clienteSeleccionado;
    return Boolean(
      this.tipoVenta === 'CREDITO' &&
      cliente &&
      cliente.limiteCredito > 0 &&
      this.deudaProyectada > cliente.limiteCredito
    );
  }

  get creditoCercaDelLimite(): boolean {
    const cliente = this.clienteSeleccionado;
    return Boolean(
      this.tipoVenta === 'CREDITO' &&
      !this.creditoExcedeLimite &&
      cliente &&
      cliente.limiteCredito > 0 &&
      this.deudaProyectada >= cliente.limiteCredito * this.limiteCreditoAdvertencia
    );
  }

  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    this.efectivoRecibido = this.tipoVenta === 'CONTADO' ? this.totalFinal : 0;

    if (this.tipoVenta === 'CREDITO' && !this.clienteIdSeleccionado) {
      alert("Debe seleccionar un cliente para ventas a crédito.");
      return;
    };

    if (this.tipoVenta === 'CREDITO' && this.creditoExcedeLimite) {
      this.showErrorMessage('La venta excede el límite de crédito del cliente.', 6000);
      return;
    };

    this.ventaRealizada = null;
    this.mostrarModalCobro = true;
  }

  confirmarVenta(): void {
    if (this.tipoVenta === 'CONTADO' && this.efectivoRecibido < this.totalFinal) {
      alert('El efectivo recibido debe cubrir el total de la venta.');
      return;
    };

    if (this.tipoVenta === 'CREDITO' && this.creditoExcedeLimite) {
      this.showErrorMessage('La venta excede el límite de crédito del cliente.', 6000);
      return;
    };

    const payload: VentaRequest = {
      productos: this.carrito.map(item => ({
        id: item.productoId,
        cantidad: item.cantidad,
        precioTipo: item.precioTipo
      })),
      descuento: this.descuento,
      tipoVenta: this.tipoVenta,
      efectivoRecibido: Number(this.efectivoRecibido),
      ...(this.tipoVenta === 'CREDITO' && this.clienteIdSeleccionado !== null
        ? { clienteId: this.clienteIdSeleccionado }
        : {})
    };

    this.isLoading = true;
    this.hasError = false;
    this.ventaService.crearVenta(payload).pipe(
      catchError((error) => {
        this.hasError = true;
        this.isLoading = false;
        console.log('Error al procesar venta: ', error);
        if (error.status === 0){
          this.showErrorMessage(
            `No se pudo conectar con el servidor.`,
            3500
          );
        } else {
          this.showErrorMessage(
            `Ocurrió un error al procesar la venta. (${error.status})`,
            3500
          );
        };
        return EMPTY;
      })
    ).subscribe((data) => {
      this.ventaRealizada = data;
      this.mostrarModalCobro = false;
      this.mostrarModalTicket = true;
      this.verificarEstadoCaja();
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 500);
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
    this.verificarEstadoCaja();
    this.recalcularTotales();
  }
}
