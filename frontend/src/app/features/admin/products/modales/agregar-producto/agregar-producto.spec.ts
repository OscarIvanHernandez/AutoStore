import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProducto } from './agregar-producto';

describe('AgregarProducto', () => {
  let component: AgregarProducto;
  let fixture: ComponentFixture<AgregarProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarProducto],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarProducto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the required-fields help panel', () => {
    component.visible = true;
    fixture.detectChanges();

    const helpButton: HTMLButtonElement = fixture.nativeElement.querySelector('.form-help__toggle');
    expect(fixture.nativeElement.querySelector('.form-help__panel')).toBeNull();

    helpButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.form-help__panel')).not.toBeNull();
    expect(helpButton.getAttribute('aria-expanded')).toBe('true');

    helpButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.form-help__panel')).toBeNull();
    expect(helpButton.getAttribute('aria-expanded')).toBe('false');
  });
});
