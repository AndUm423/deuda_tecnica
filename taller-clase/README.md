# Taller Práctico en Clase: «El Monolito Tóxico»

---

##  Propósito del Ejercicio
Simular el relevo forzado de un servicio crítico en producción sin pruebas automatizadas, con variables crípticas, acoplamiento severo y dependencias implícitas. El objetivo es vivenciar las **fricciones de proceso y de código** que genera la deuda técnica acumulada, para luego aplicar técnicas formales de saneamiento bajo el marco de **ISO/IEC 25010**.

---

##  Requisitos y Puesta en Marcha
* **Node.js** v18+ instalado.
* No requiere `npm install` de librerías externas para arrancar (usa módulos nativos de Node.js).
* Para verificar el funcionamiento base del sistema actual:
  ```bash
  npm run simulate
  ```

---

## ⏱ Dinámica del Taller: 3 Rondas de Tensión Realista

###  Ronda 1 • Presión de Entrega (20 minutos)
**Premisa:** Es viernes por la tarde. El área comercial exige una nueva funcionalidad urgente antes de salir a producción. No hay tiempo presupuestado para pruebas.

Los estudiantes se dividen en dos sub-equipos por grupo:
* **Equipo A (Rama `feature/descuentos-flash`):**
  * Crear la rama: `git checkout -b feature/descuentos-flash`
  * Regla de negocio requerida: Si el pedido se realiza con cupón `'FLASH25'` y el subtotal supera los $100 USD, aplicar un **descuento adicional del 25%**, pero este descuento NO puede combinarse con el cupón `'DESC5'`.
  * Modificar directamente `src/legacy_order_service.js`.
  * Probar ejecutando `npm run simulate`.
  * Hacer commit en su rama: `git commit -am "feat: descuento flash urgente"`

* **Equipo B (Rama `feature/envio-express-vip`):**
  * Crear la rama: `git checkout -b feature/envio-express-vip`
  * Regla de negocio requerida: Los clientes VIP con compras locales superiores a 150 USD tienen derecho a un recargo de envío express prioritario de solo 1.50 USD en lugar de la tarifa estándar, pero si el pedido es internacional, se les debe otorgar un subsidio de $10 USD de descuento sobre el costo de aduanas.
  * Modificar directamente `src/legacy_order_service.js`.
  * Probar ejecutando `npm run simulate`.
  * Hacer commit en su rama: `git commit -am "feat: logica envio express vip"`

---

###  Ronda 2 • Intercambio de Ramas a Ciegas (15 minutos)
**Premisa:** Relevo de emergencia. El desarrollador original se fue de vacaciones o renunció.
* **El Equipo A debe hacer checkout a la rama del Equipo B**, y **el Equipo B a la del Equipo A**.
* **Regla estricta:** Está prohibido comunicarse verbalmente entre equipos. Deben entender los cambios únicamente leyendo el código y el mensaje de commit.
* Ambos equipos deben intentar hacer `git merge` de ambas ramas sobre una rama común `staging` o `main`.
* **Resultado inevitable:** Conflictos masivos de Git en `src/legacy_order_service.js`. Al resolver a mano, deberán verificar si `npm run simulate` sigue funcionando o si se rompieron casos de borde preexistentes.

---

###  Ronda 3 • Saneamiento ISO/IEC 25010 (25 minutos)
**Premisa:** La gerencia aprueba una ventana técnica para sanear el servicio antes de que colapse.
Aplicar ingeniería de calidad:

1. **Pruebas de Caracterización (Golden Master Testing):**
   * Crear la carpeta `test/` y escribir pruebas con el runner nativo de Node.js (`node --test`).
   * Capturar el comportamiento actual del sistema (entradas y salidas) para garantizar que el refactor no altere las reglas existentes.
2. **Refactorización Limpia:**
   * Renombrar variables (`x`, `tmp_total`, `d`, `flag`, `aux`) a nombres de dominio claros (`orderRequest`, `subtotal`, `discountAmount`, etc.).
   * Extraer responsabilidades en funciones puras e independientes:
     * `validateOrder(order)`
     * `calculateDiscounts(userType, coupon, subtotal)`
     * `calculateTaxesAndShipping(subtotal, isInternational)`
     * `reserveInventory(items)` con soporte de reversión limpia.
3. **Eliminar efectos colaterales:**
   * No mutar los objetos que entran por parámetro.
   * Evitar variables globales mutables para configuración o errores.
4. **Verificación final:**
   * Correr las pruebas unitarias: `npm test`.

---

##  Rúbrica de Aprendizaje y Discusión
1. ¿Cuánto tiempo se perdió intentando entender las variables de una sola letra (`x`, `d`, `aux`)?
2. ¿Por qué el merge de Git falló tan dramáticamente? (Principio de Responsabilidad Única violado: todos tocaron el mismo archivo gigante).
3. ¿Cómo evitaron las Pruebas de Caracterización introducir regresiones accidentales en la Ronda 3?
