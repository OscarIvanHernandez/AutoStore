import { Routes } from '@angular/router';
import { AdminLayout} from './shared/admin-layout/admin-layout';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Products } from './features/admin/products/products';
import { Sales } from './features/admin/sales/sales';
import { SalesHistory } from './features/admin/sales-history/sales-history';

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
      {path: 'ventas/historial', component: SalesHistory}
    ]
  }
];
