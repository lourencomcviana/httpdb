#HSLIDE
# Análise de modificação do procedimento de rescisão
#HSLIDE
## Pontos afetados
  1. taxpaoc.pkg_parcelamento.stp_revogar_anistia
      Mais complexo (1632 linhas)
  2. taxpaoc.pkg_parcelamento.stp_revogar_da
  3. taxpaoc.pkg_parcelamento.stp_revogar_normal
  4. divativa.pkg_procaut.stp_prep_batch_revogacao
  5. divativa.pkg_procaut.stp_proc_batch_revogacao
  6. parcelamento_portal.p_rescindir_pedido
  7. parcelamento_portal.p_calculo_amortizacao

#HSLIDE
## Principais modificações
#HSLIDE
### Calculos de rescisão são diferentes.
Segundo a IN, a data de cálculo teria que mudar, pois a revogação 
  utiliza a data de pagamento e não a data de geração do parcelamento:
  
  "...Após a rescisão, primeiramente, serão amortizadas aos débitos as 
  parcelas pagas pelo valor original da **data da geração do 
  parcelamento**, considerando o saldo das dívidas na mesma data 
  base, da seguinte forma..."
#HSLIDE
### Amortização
Outro aspecto que haveria mudança seria quanto a amortização, que 
na nova rotina é feita a cada pagamento e na antiga somente na execução
da rotina. Desta forma haveria a necessidade de realizar
previamente a amortização de todos os parcelamentos realizados
nos parcelamentos em curso. que hoje totalizam em 4107.

#HSLIDE
Tabém seria necessário udar a forma de distribuição dos créditos 
oriundos dos pagamentos efetuados,que hoje é realizado percentualmente 
ara uma abordagem que seria imputado a partir damulta seguindo do juros
e por fim do principal (em discussão)
#HSLIDE
#### Lista de parcelamentos afetados
parcelamentos legados não possuem amortização (necessário atualiza-los)

lista gerada em 13/02/2017: 

TFI_Tipo_FINANCIAMENTO | TFI_TIC_TIM_COD_IMPUESTO | TOTAL
---------------------- | -------------------------| ------ 
1 | 128 | 11
1 | 127 | 125
1 | 129 | 7
1 | 126 | 227
2 | 138 | 435
2 | 137 | 551
2 | 149 | 45
5 | 137 | 67
9 | 126 | 3
9 | 138 | 3
9 | 137 | 1
15 | 167 | 522
15 | 136 | 587
17 | 116 | 425
17 | 117 | 80
19 | 156 | 2
19 | 116 | 745
19 | 129 | 49
19 | 127 | 46
19 | 128 | 4
19 | 117 | 41
19 | 126 | 131
Total |  | 4107


#HSLIDE
### Estrutura de dados
A nova rotina faz uso de novas estruturas de dados. Vinculadas ao novo
parcelamento, o mesmo precisaria ser adptado para coexistir com o antigo.
Algo indesejável.
#HSLIDE
### Diferenças pontuais em rotinas

- Na rotina da revogação de parcelamentos normais
  - O saldo remanescente é consolidado através da conta 5,
  algo que não existe mais na nova rotina.
  - O débito original é inscrito na dívida ativa diretamente. No novo fluxo
  essa tarefa é de responsabilidade do processo de inscrição em dívida ativa,
  que é apartado do parcelamento.
- Na rotina da revogação de parcelamentos em divida ativa
  - as etapas lançadas são diferentes.
#HSLIDE
### Conclusão
Tantas modificações no parcelamento antigo acarretam o risco de inconsistências
e o risco de futuras adpações nos mesmos. Incluindo adequar outras normais de novas instruções normativas.
#HSLIDE
## Prazos

Estimado: 1 mês e meio.

