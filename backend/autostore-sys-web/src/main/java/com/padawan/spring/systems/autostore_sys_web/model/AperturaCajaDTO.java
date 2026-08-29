package com.padawan.spring.systems.autostore_sys_web.model;

import java.math.BigDecimal;

public class AperturaCajaDTO {
    private BigDecimal efectivoInicial;

    public BigDecimal getEfectivoInicial(){ return efectivoInicial; }

    public void setEfectivoInicial(BigDecimal value) {this.efectivoInicial = value; }
}
