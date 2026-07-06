import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { Aside } from '../aside/aside';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, Aside],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {}
