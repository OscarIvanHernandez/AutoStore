import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SaleTicket } from './sale-ticket';

describe('SaleTicket', () => {
  let component: SaleTicket;
  let fixture: ComponentFixture<SaleTicket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleTicket]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SaleTicket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
