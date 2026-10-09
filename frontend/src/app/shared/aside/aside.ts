import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-aside',
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './aside.html',
  styleUrl: './aside.css',
})
export class Aside {}
