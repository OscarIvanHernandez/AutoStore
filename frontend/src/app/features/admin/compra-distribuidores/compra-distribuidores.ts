import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompraRequest, Distribuidor, ItemCarrito, ProductoInterface } from '../../../services/autostore.models';
import { DistribuidorService } from '../../../services/autostore.distribuidor-service';
import { ProductoService } from '../../../services/autostore.product-service';
import { CompraDistribuidorService } from '../../../services/autostore.compra-distribuidor-service';

@Component({
  selector: 'app-compra-distribuidores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compra-distribuidores.html',
  styleUrl: './compra-distribuidores.css',
})
export class CompraDistribuidores implements OnInit{

  distribuidores: Distribuidor[] = [];
  productos: ProductoInterface[] = [];

  // Formulario principal
  distribuidorSeleccionadoId: number | null = null;
  folio: string = '';

  // Formulario para agregar producto al carrito de entrada
  productoSeleccionado: ProductoInterface | null = null;
  cantidad: number = 1;
  precioUnitarioCompra: number = 0;

  // Carrito de compras
  items: ItemCarrito[] = [];
  totalCompra: number = 0;

  constructor(
    private distribuidorService: DistribuidorService,
    private productoService: ProductoService,
    private compraService: CompraDistribuidorService
  ) {}

  ngOnInit(): void {
    this.distribuidorService.listar().subscribe(data => this.distribuidores = data);
    this.productoService.getProductos().subscribe(data => this.productos = data);
  }

  onSeleccionarProducto(): void {
    if (this.productoSeleccionado) {
      // Sugiere el precio de compra actual registrado en el producto
      this.precioUnitarioCompra = this.productoSeleccionado.precioCompra || 0;
    }
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || this.cantidad <= 0 || this.precioUnitarioCompra <= 0) return;

    const subtotal = this.cantidad * this.precioUnitarioCompra;

    this.items.push({
      productoId: this.productoSeleccionado.id!,
      nombre: this.productoSeleccionado.nombre,
      cantidad: this.cantidad,
      precioUnitario: this.precioUnitarioCompra,
      subTotal: subtotal,
      precioTipo: 'MOSTRADOR',
      stockMaximo: this.productoSeleccionado.stockActual
    });

    this.calcularTotal();
    this.limpiarSeleccionProducto();
  }

  quitarItem(index: number): void {
    this.items.splice(index, 1);
    this.calcularTotal();
  }

  calcularTotal(): void {
    this.totalCompra = this.items.reduce((acc, item) => acc + item.subTotal, 0);
  }

  guardarCompra(): void {
    if (!this.distribuidorSeleccionadoId || this.items.length === 0) {
      alert('Seleccione un distribuidor y al menos un producto.');
      return;
    }

    const payload: CompraRequest = {
      distribuidorId: this.distribuidorSeleccionadoId,
      folio: this.folio,
      productos: this.items.map(item => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioCompra: item.precioUnitario
      }))
    };

    this.compraService.registrarCompra(payload).subscribe({
      next: () => {
        alert('📦 Entrada de mercancía registrada. Stock e historial actualizados.');
        this.items = [];
        this.folio = '';
        this.totalCompra = 0;
      },
      error: (err) => alert('Error al registrar compra: ' + err.error?.message)
    });
  }

  private limpiarSeleccionProducto(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.precioUnitarioCompra = 0;
  }
}
