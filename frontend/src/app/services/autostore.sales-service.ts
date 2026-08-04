import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private apiURL = 'http://localhost:8080/api/ventas';


}
