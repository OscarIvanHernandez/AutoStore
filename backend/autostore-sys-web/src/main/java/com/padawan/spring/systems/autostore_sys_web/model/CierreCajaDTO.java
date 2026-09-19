package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;

public class CierreCajaDTO {
    private BigDecimal efectivoReal;

    public BigDecimal getEfectivoReal(){ return efectivoReal; }
    
    public void setEfectivoReal(BigDecimal value){ this.efectivoReal = value; }
}
