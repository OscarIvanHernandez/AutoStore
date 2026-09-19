import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Distribuidores } from './distribuidores';

describe('Distribuidores', () => {
  let component: Distribuidores;
  let fixture: ComponentFixture<Distribuidores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Distribuidores],
    }).compileComponents();

    fixture = TestBed.createComponent(Distribuidores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
