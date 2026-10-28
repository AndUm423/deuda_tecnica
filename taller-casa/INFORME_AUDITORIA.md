# Informe Técnico de Auditoría Forense y Plan de Remediación Continua

> **Cliente:** FastPay Global Inc.  
> **Equipo consultor:** Equipo de trabajo (completar con los integrantes)  
> **Fecha:** 28/10/2026  
> **Repositorio auditado:** https://github.com/NREYD/deuda_tecnica  
> **Componente:** `taller-casa/fastpay-service`  
> **Commit base analizado:** pendiente de registrar con `git rev-parse <rama-base>`  
> **Commit remediado:** pendiente de registrar después de integrar y validar los cambios  

> **Alcance y rigor de la auditoría:** las métricas de incidentes de este informe se calcularon a partir de `data/incidents-history.json`. Las horas de remediación, el costo de reconstrucción y el escenario de ROI son estimaciones de planificación, no costos contables auditados. Los resultados “después” de cobertura, linter, auditoría de dependencias y CI deben completarse con ejecuciones reales; no se declaran aprobados sin evidencia.

---

## 1. Resumen ejecutivo

### 1.1 Diagnóstico de situación

La revisión del motor legado `src/legacy_billing_engine.js` identifica concentración de responsabilidades en `processSubscriptionBilling`: lectura y escritura del archivo de suscripciones, validación de estados, cálculo de impuestos y descuentos, simulación de la pasarela y actualización de saldos se ejecutan en una misma función. Esto dificulta entender las reglas, probarlas de forma aislada y modificar una política tributaria sin afectar otros comportamientos.

El motor usa operaciones síncronas de archivo (`fs.readFileSync` y `fs.writeFileSync`), variables globales mutables, importes monetarios con `Number` y tasas/números mágicos. También contiene una clave de pasarela incrustada en el código y la incluye en un mensaje de log cuando ocurre un fallo. No existe un control de idempotencia durable que impida procesar varias veces un mismo cobro. El servidor también expone trazas de error en respuestas HTTP, lo que puede divulgar detalles internos. Estos hallazgos son coherentes con los incidentes registrados de bloqueo del Event Loop, cobros duplicados, regresiones, filtración de credenciales y saldos inconsistentes.

La remediación propuesta separa el dominio, la aplicación, los puertos y los adaptadores de infraestructura; introduce un objeto de valor `Money`; mueve las reglas tributarias a un módulo aislado; retira el secreto del código; añade pruebas de dominio y aplicación y configura un flujo de CI. La implementación de demostración aún requiere fortalecer la persistencia e idempotencia para producción: un `Map` en memoria no coordina varias instancias y el repositorio JSON no ofrece transacciones distribuidas.

### 1.2 Métricas consolidadas

| Métrica | Estado inicial (legacy) | Estado final / verificación requerida | Meta |
|---|---|---|---|
| Complejidad ciclomática máxima | El archivo reporta en comentarios una complejidad superior a 16 para el método principal; medir con herramienta para obtener valor reproducible | Pendiente de medir tras refactor | ≤ 8 por función, según objetivo del taller |
| Complejidad cognitiva máxima | El código contiene anidamiento y numerosas ramas; no se obtuvo un valor calculado por herramienta | Pendiente de medir | ≤ 10, según objetivo del taller |
| Cobertura de pruebas | Dos pruebas legacy iniciales; cobertura no medida | Pendiente de ejecutar `c8`/herramienta equivalente | ≥ 80% en dominio y aplicación |
| Vulnerabilidades altas/críticas | Pendiente de ejecutar `npm audit` en el estado base | Pendiente de ejecutar en la rama remediada | 0 altas/críticas |
| Violaciones de ESLint | El proyecto incluye configuración ESLint; el recuento debe extraerse de `npm run lint` en la rama base | Pendiente de validar con la configuración final | 0 errores críticos |
| Technical Debt Ratio (TDR) | Estimación: 13% | No recalculado; requiere nueva estimación tras medir el trabajo realizado | < 5% como objetivo aspiracional |
| Horas de indisponibilidad del trimestre | 17 h acumuladas | Se debe medir durante el periodo posterior al despliegue | Tendencia descendente |
| Pérdidas directas registradas | USD 49.470 | Se debe comparar con el siguiente trimestre | Tendencia descendente |

No se presentan números “después” inventados: el informe debe actualizarse una vez ejecutadas las pruebas, la auditoría y el pipeline en el commit final.

---

## 2. Inventario formal y clasificación de deuda técnica

La clasificación de Fowler requiere contexto de por qué se tomó la decisión y qué se sabía en ese momento. Las categorías siguientes son una evaluación inicial basada en el código y en la causa raíz registrada en cada incidente.

| ID | Ubicación | Tipo / hallazgo | Cuadrante de Martin Fowler | Subcaracterística ISO/IEC 25010 | Principal estimado |
|---|---|---|---|---|---:|
| DT-01 | `src/legacy_billing_engine.js`, `processSubscriptionBilling` | **God Method / Large Method**: combina negocio, impuestos, pasarela, persistencia y actualización de estado | Deliberada – Temeraria (según contexto consignado para los hotfixes); validar con el equipo | Mantenibilidad: modularidad, analizabilidad y modificabilidad | 16 h |
| DT-02 | `src/legacy_billing_engine.js`, constante `API_SECRET_GATEWAY` y log de error | **Secreto hardcodeado y exposición en logs** | Deliberada – Temeraria, según bitácora | Seguridad: confidencialidad y responsabilidad | 4 h |
| DT-03 | Lectura/escritura de `data/subscriptions.json` | **Riesgo de concurrencia y actualización no transaccional**; varias solicitudes pueden procesar la misma suscripción | Inadvertida – Temeraria, según bitácora | Fiabilidad: tolerancia a fallos y recuperabilidad | 24 h |
| DT-04 | Bloque de llamada simulada a pasarela en `legacy_billing_engine.js` | **Sin timeout robusto, backoff ni circuit breaker**; respuesta externa insuficientemente aislada | Inadvertida – Prudente, según bitácora | Fiabilidad: recuperabilidad | 12 h |
| DT-05 | `test/legacy.test.js` | **Pruebas insuficientes**: no cubren idempotencia, invariantes de saldo, impuestos por país o concurrencia | Deliberada – Temeraria, de acuerdo con el incidente de regresión | Mantenibilidad: testeabilidad | 14 h |
| DT-06 | Cálculos monetarios en `legacy_billing_engine.js` | **Primitive Obsession y números de punto flotante** para dinero | Inadvertida – Temeraria, según bitácora | Adecuación funcional: exactitud | 8 h |

**Riesgo adicional de servidor:** `src/server.js` devuelve `err.stack` en respuestas HTTP de error 500. Debe sustituirse por un mensaje genérico para el cliente, conservarse el detalle en logs protegidos y añadirse un identificador de correlación.

### 2.1 Relación con ISO/IEC 25010

- **Mantenibilidad:** dividir el método principal en funciones y módulos cohesivos mejora modularidad, analizabilidad, modificabilidad y testeabilidad.
- **Fiabilidad:** controles de idempotencia durables, persistencia transaccional, manejo de fallos y recuperación reducen el riesgo de cobros repetidos o estados inconsistentes.
- **Seguridad:** retirar credenciales del repositorio, rotarlas si fueron expuestas y evitar revelar stack traces reduce la exposición de secretos y detalles internos.
- **Eficiencia de desempeño:** reemplazar I/O síncrono en rutas de alta carga reduce el bloqueo del Event Loop. El repositorio JSON de la versión didáctica sigue usando I/O síncrono y debe sustituirse por un adaptador asíncrono/transaccional para producción.
- **Adecuación funcional:** representar importes mediante centavos enteros y reglas explícitas reduce errores de redondeo.

---

## 3. Análisis forense de incidentes y cuantificación de intereses

### 3.1 Impacto acumulado de la inacción

La suma se calculó sobre los seis registros de `data/incidents-history.json`:

| ID de incidente | Fecha | Indisponibilidad | Pérdida financiera | Horas de ingeniería |
|---|---|---:|---:|---:|
| INC-2026-0704 | 04/07/2026 | 3,5 h | USD 8.750 | 26 h |
| INC-2026-0718 | 18/07/2026 | 6 h | USD 14.200 | 34 h |
| INC-2026-0802 | 02/08/2026 | 2 h | USD 6.300 | 18 h |
| INC-2026-0815 | 15/08/2026 | 4,5 h | USD 11.800 | 40 h |
| INC-2026-0829 | 29/08/2026 | 1 h | USD 3.500 | 15 h |
| INC-2026-0912 | 12/09/2026 | 0 h | USD 4.920 | 28 h |
| **Total** | | **17 h** | **USD 49.470** | **161 h** |

La bitácora reporta 142 + 820 + 310 + 95 + 0 + 530 = **1.897 afectaciones de clientes por incidente** si se suman los campos tal como están registrados. Esta suma no demuestra que sean 1.897 clientes únicos, porque una persona podría aparecer en más de un incidente.

### 3.2 Principal de remediación y TDR

Estimación de esfuerzo del plan de remediación:

| Ítem | Horas estimadas |
|---|---:|
| DT-01: separación del God Method | 16 h |
| DT-02: gestión segura de credenciales | 4 h |
| DT-03: idempotencia y transacciones | 24 h |
| DT-04: resiliencia de pasarela | 12 h |
| DT-05: pruebas de regresión | 14 h |
| DT-06: objeto Money y reglas monetarias | 8 h |
| **Total principal estimado** | **78 h** |

Con una tarifa de planificación de USD 45 por hora:

- **Principal (P):** 78 h × USD 45/h = **USD 3.510**.
- **Costo de reconstrucción (C):** 600 h × USD 45/h = **USD 27.000**.
- **TDR inicial estimado:** (USD 3.510 / USD 27.000) × 100 = **13%**.

El TDR compara un esfuerzo de remediación estimado con un costo de reconstrucción estimado. No equivale a la proporción de pérdidas operativas ni debe presentarse como un valor contable medido.

### 3.3 Escenario ilustrativo de retorno de inversión

Para construir un escenario conservador, se supone que la remediación evita el **25%** de las pérdidas trimestrales registradas:

- Ahorro trimestral hipotético: USD 49.470 × 25% = **USD 12.367,50**.
- Ahorro mensual promedio hipotético: USD 12.367,50 / 3 = **USD 4.122,50**.
- Recuperación simple del principal: USD 3.510 / USD 4.122,50 = **0,85 meses** aproximadamente.
- Retorno neto del primer trimestre bajo ese supuesto: (USD 12.367,50 − USD 3.510) / USD 3.510 × 100 = **252,2%**.

Este escenario **no es una promesa ni una predicción garantizada**. Depende de que se evite efectivamente el 25% de las pérdidas y no incluye costos de operación, migración, observabilidad o soporte. Debe recalcularse con resultados reales posteriores al despliegue.

---

## 4. Matriz de priorización y registro de deuda táctica

### 4.1 Matriz de impacto de negocio vs. esfuerzo

| | Bajo esfuerzo | Alto esfuerzo |
|---|---|---|
| **Alto impacto** | **Sprint 1 – P1:** DT-02, retirar/rotar el secreto y eliminar su impresión en logs; añadir pruebas monetarias DT-06 | **Sprint 1 – P1:** DT-03, idempotencia y transacción durable para impedir cobros duplicados; comenzar DT-01 para descomponer el método principal |
| **Impacto medio** | **Sprint 1 – P2:** completar pruebas de caracterización DT-05 y asegurar manejo de errores sin filtrar detalles | **Sprint 2 – P2/P3:** DT-04, timeout, política de reintentos con backoff y circuit breaker; migración del repositorio a una base de datos transaccional |

**Orden recomendado:** primero revocar/rotar cualquier secreto expuesto; luego garantizar integridad de los cobros; a continuación corregir importes y ampliar pruebas; por último completar la resiliencia de infraestructura sin dejarla fuera del plan de trabajo.

### 4.2 Registro de deuda táctica deliberada

- **ID:** TDR-DEC-01.
- **Decisión técnica:** utilizar `MockPaymentGateway` durante el desarrollo y la validación automatizada, aplazando la integración del SDK de la pasarela real.
- **Justificación de negocio:** permite construir y verificar las reglas de dominio sin credenciales reales, costos de transacción ni dependencia de disponibilidad externa durante el taller.
- **Riesgo asumido:** el mock no reproduce fallos parciales, latencia, conciliación, liquidación ni todos los códigos de error del proveedor.
- **Mitigación temporal:** mantener pruebas unitarias, agregar pruebas de contrato y ejecutar pruebas de sandbox antes de liberar; no permitir cobros reales desde el mock; monitorear errores y limitar reintentos.
- **Responsable:** líder técnico del equipo (completar con nombre).
- **Fecha límite de pago (Debt Ceiling):** antes del primer despliegue productivo posterior al taller. Registrar fecha calendario y responsable al planificar el release.
- **Condición de cierre:** adaptador real probado en sandbox, secretos en un gestor seguro, idempotencia durable y evidencia de pruebas de contrato aprobadas.

---

## 5. Arquitectura de remediación y red de seguridad

### 5.1 Pruebas de caracterización (Golden Master)

El principio de caracterización es registrar las reglas de negocio válidas del legado antes de modificarlo. Los casos iniciales de `test/legacy.test.js` solo cubrían un cobro básico y la consulta de una suscripción inexistente; no constituían una red de seguridad suficiente para cambios de facturación.

Para mejorar esa red de seguridad, la propuesta incorpora:

- `test/characterization.test.js`: verificación de `Money`, impuestos de Colombia y México, recargo por transferencia y descuento anual Enterprise Plus.
- `test/billing-service.test.js`: cobro válido, repetición de clave idempotente y suscripción inexistente.
- Pruebas adicionales recomendadas antes de declarar la solución completa: suscripción suspendida/inactiva, gateway rechazado, moneda incompatible, redondeo de límites, persistencia fallida, reintento después de caída de proceso, dos solicitudes simultáneas y misma clave desde dos instancias.

Estas pruebas deben ejecutarse con `npm test`. La cobertura debe medirse de forma explícita; no se ha afirmado que se cumpla el 80% mientras no se publique un reporte de cobertura.

### 5.2 Estructura hexagonal propuesta

```text
fastpay-service/
├── data/
│   ├── incidents-history.json
│   └── subscriptions.json
├── src/
│   ├── domain/
│   │   ├── money.js
│   │   ├── tax-rules.js
│   │   └── billing.js
│   ├── application/
│   │   └── billing-service.js
│   ├── ports/
│   │   └── subscription-repository.js
│   ├── infrastructure/
│   │   ├── json-subscription-repository.js
│   │   └── mock-payment-gateway.js
│   └── server.js
├── test/
│   ├── legacy.test.js
│   ├── characterization.test.js
│   └── billing-service.test.js
├── scripts/
│   └── simulate_billing.js
├── .env.example
└── package.json
```

`domain` contiene reglas puras; `application` coordina los casos de uso; `ports` expresa los contratos esperados; `infrastructure` contiene adaptadores concretos; `server.js` es el adaptador HTTP. El archivo `incidents-history.json` se conserva como evidencia de auditoría, no como dependencia de ejecución del dominio.

### 5.3 Principios SOLID y patrones aplicados

- **SRP (responsabilidad única):** separar el cálculo tributario (`tax-rules.js`), cálculo de facturación (`billing.js`), representación monetaria (`money.js`), orquestación (`billing-service.js`), persistencia y pasarela.
- **OCP (abierto/cerrado):** concentrar las reglas tributarias por país en una tabla extensible y cubrir cada regla con pruebas, evitando dispersar condicionales por el servidor.
- **Value Object:** `Money` almacena centavos enteros, limita los valores a enteros seguros y verifica que las monedas coincidan en operaciones aritméticas.
- **Puertos y adaptadores:** el caso de uso recibe un repositorio y una pasarela por constructor, permitiendo sustituir adaptadores en pruebas.
- **Idempotencia:** la demostración guarda resultados completados en memoria y envía una clave a la pasarela. En producción debe persistirse la clave y su resultado junto con el estado del cobro en almacenamiento compartido y transaccional; un `Map` de proceso no es suficiente.
- **Gestión de secretos:** quitar la clave hardcodeada y no imprimir secretos. Si la clave del repositorio fue real o reutilizable, debe revocarse/rotarse; eliminarla del archivo no invalida copias históricas.
- **Errores HTTP:** evitar responder con `err.stack` o mensajes internos; conservar trazas en logs protegidos con identificadores de correlación.

---

## 6. Verificación de Quality Gates en GitHub Actions

### 6.1 Workflow

Archivo: [`.github/workflows/quality-gate.yml`](https://github.com/NREYD/deuda_tecnica/blob/main/.github/workflows/quality-gate.yml).

El workflow debe ejecutarse ante `push` y `pull_request` hacia `main`, instalar dependencias de `taller-casa/fastpay-service`, ejecutar ESLint, `npm audit --audit-level=high` y `npm test`. La ruta de caché y el directorio de trabajo deben apuntar al `package-lock.json` y a `taller-casa/fastpay-service`, no a la raíz si allí no está el `package.json` del servicio.

Para cumplir completamente la guía aún se debe configurar un umbral de cobertura real (por ejemplo, con `c8` o herramienta equivalente) y hacer fallar el job si cae por debajo del 80%. También hay que confirmar que ESLint realmente aplica las reglas de complejidad previstas.

### 6.2 Evidencias requeridas

1. **PR bloqueado por un Quality Gate:** pendiente de adjuntar enlace/captura de una ejecución real donde una prueba falle o una regla crítica de lint/cobertura bloquee la integración. No se deben inventar capturas ni presentar fallos de otra rama como evidencia de esta solución.
2. **PR final aprobado:** pendiente de adjuntar enlace/captura cuando todos los checks pasen en la rama que contiene esta remediación.
3. **Resultados reproducibles:** guardar las salidas reales de `npm test`, `npm run lint`, `npm audit --audit-level=high` y del comando de cobertura en el commit que se presenta como final.

**Estado del informe:** esta sección se deja expresamente pendiente hasta obtener evidencia de GitHub Actions del taller para la casa.

---

## 7. Conclusiones y gobernanza continua (ISO/IEC/IEEE 12207)

### 7.1 ¿Cómo previenen la arquitectura hexagonal y los Value Objects la reaparición de deuda inadvertida?

La arquitectura hexagonal mantiene las reglas de dominio fuera de Express, archivos y pasarelas específicas. Así, los cambios de infraestructura no obligan a modificar las reglas de facturación y pueden probarse mediante adaptadores. Los Value Objects encapsulan invariantes monetarias (centavos enteros y moneda compatible), reduciendo errores repetidos de redondeo y evitando que cada módulo implemente su propia aritmética. Sin embargo, la arquitectura por sí sola no garantiza calidad: requiere pruebas, revisiones de código, estándares de diseño y seguimiento de métricas.

### 7.2 ¿Cómo asumir deuda deliberada sin convertirla en negligente?

Debe registrarse antes de asumirla, con motivación de negocio, alternativas evaluadas, riesgos, alcance, responsable, controles paliativos, fecha límite de pago y criterio verificable de cierre. La decisión debe tener aprobación del responsable técnico y del dueño del producto, revisarse en cada planificación y escalarse si el vencimiento se aproxima. No debe aceptarse como deuda táctica una decisión que exponga credenciales, comprometa la integridad de cobros o eluda controles obligatorios.

### 7.3 ¿Cómo justificar ante el CFO dedicar 20% de cada sprint a pagar deuda?

Se debe relacionar esa inversión con datos: pérdidas por incidentes, horas de ingeniería fuera de horario, reembolsos, MTTR, tasa de cobros duplicados, defectos que llegan a producción y tiempo de entrega de cambios. Para el escenario ilustrativo calculado, evitar el 25% de las pérdidas del trimestre representaría USD 12.367,50 frente a USD 3.510 de principal estimado. Ese caso es atractivo, pero debe contrastarse con un periodo posterior para validar causalidad y evitar atribuir al refactor ahorros debidos a otros factores. Una reserva del 20% debe tratarse como una política revisable según evidencia y riesgo, no como una regla arbitraria.

### 7.4 Plan de gobernanza continua

1. Revisar y priorizar el registro de deuda en cada sprint.
2. No integrar cambios de facturación sin pruebas automáticas y revisión de seguridad.
3. Mantener CI como condición requerida para fusionar a `main`.
4. Medir cobertura, complejidad, vulnerabilidades, incidentes, MTTR y reembolsos en cada release.
5. Revisar los ítems de deuda táctica y cerrar o renegociar los que se acerquen a su fecha límite.
6. Programar una revisión posterior al despliegue y actualizar los cálculos del TDR/ROI con datos observados.

---

## Checklist de entrega

- [ ] Confirmar integrantes, fecha y hashes reales de commits.
- [ ] Mantener `data/incidents-history.json` y `data/subscriptions.json`.
- [ ] Ejecutar `npm ci`, `npm test`, `npm run lint` y `npm audit --audit-level=high` desde `taller-casa/fastpay-service`.
- [ ] Configurar y ejecutar medición de cobertura con umbral mínimo del 80%.
- [ ] Confirmar que CI usa el directorio de trabajo y `package-lock.json` correctos.
- [ ] Adjuntar evidencia real de PR bloqueado y de PR aprobado.
- [ ] Actualizar las métricas “después” usando resultados medidos, no estimaciones.
- [ ] Revisar la idempotencia con almacenamiento duradero antes de afirmar preparación para producción.
