import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearEditar } from './crear-editar';

describe('CrearEditar', () => {
  let component: CrearEditar;
  let fixture: ComponentFixture<CrearEditar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearEditar],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearEditar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
