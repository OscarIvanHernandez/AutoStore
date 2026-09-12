import { Routes } from '@angular/router';
import { AdminLayout} from './shared/admin-layout/admin-layout';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Products } from './features/admin/products/products';
import { Sales } from './features/admin/sales/sales';
import { SalesHistory } from './features/admin/sales-history/sales-history';
import { HistoricoCaja } from './features/admin/historico-caja/historico-caja';
import { Clientes } from './features/admin/clientes/clientes';
import { CompraDistribuidores } from './features/admin/compra-distribuidores/compra-distribuidores';
import { Distribuidores } from './features/admin/distribuidores/distribuidores';
import { HistoricoMercancia } from './features/admin/historico-mercancia/historico-mercancia';

export const routes: Routes = [
  // Espacio para rutas publicas

  //

  // Rutas privadas
  { path: 'admin',
    component: AdminLayout,
    children:[
      {path: 'tablero', component: Dashboard},
      {path: 'productos', component: Products},
      {path: 'punto-de-venta', component: Sales},
      {path: 'ventas/historial', component: SalesHistory},
      {path: 'historico-de-caja', component: HistoricoCaja},
      {path: 'clientes', component: Clientes},
      {path: 'distribuidores', component: Distribuidores},
      {path: 'entrada-de-mercancia', component: CompraDistribuidores},
      {path: 'historico-de-mercancia', component: HistoricoMercancia},
    ]
  }
];
