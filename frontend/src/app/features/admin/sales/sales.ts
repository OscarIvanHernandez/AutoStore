import { ProductoService } from './../../../services/autostore.product-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ItemCarrito, ProductoInterface, VentaRequest } from '../../../services/autostore.models';
import { SaleService } from '../../../services/autostore.sales-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    this.cdr.detectChanges();

    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  private showErrorMessage(message: string, duration: number): void {
    this.errorMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.errorMessage = null;
      this.cdr.detectChanges();
    }, duration);
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.productoService.getProductosActivos().subscribe({
      next: (productos) => {
        console.log('Productos cargados:', productos);
        this.productos = productos;
        this.isLoading = false;
        setTimeout(() =>{
          this.cdr.detectChanges();
        }, 1500);
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

  // Enviar la venta
  procesarVenta(): void {
    if (this.carrito.length === 0) return;

    if (this.tipoVenta === 'CREDITO' && !this.clienteIdSeleccionado) {
      alert("Debe seleccionar un cliente para ventas a crédito.");
      return;
    }
    const procesarVenta: VentaRequest = {
      productos: this.carrito.map(item => ({
        productoId: item.productoId,
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
      },
      error: (err) => alert('Error al procesar la venta: ' + err.error?.message)
    });
  }

}
