# Guía del Docente: Taller «El Monolito Tóxico»
**Especialización en Ingeniería de Software**

---

## 📌 Metodología Pedagógica
Este taller no busca evaluar si los estudiantes saben programar algoritmos complejos, sino confrontarlos con el **impacto organizacional y humano** de la deuda técnica.

### Momentos clave a observar durante la sesión:

1. **Durante la Ronda 1 (Presión de entrega):**
   * Notarás que casi ningún equipo creará un archivo nuevo ni escribirá tests; se limitarán a añadir `if/else` dentro de `process_order`.
   * En la discusión plenaria, haz énfasis en: *"¿Por qué no crearon tests si sabían que era buena práctica? Porque la presión de entrega y la falta de una suite previa desincentivan la disciplina"*.

2. **Durante la Ronda 2 (Intercambio de ramas):**
   * Observa la frustración al leer nombres de variables como `aux`, `d`, `flag`, `tmp_total`.
   * El merge de Git generará conflictos en las líneas 50-90. Observa cómo algunos equipos sobrescribirán los cambios del otro equipo sin darse cuenta.
   * Al correr `npm run simulate`, muchas órdenes fallarán.

3. **Durante la Ronda 3 (Saneamiento):**
   * Guiar a los estudiantes para que **NO** comiencen borrando el código legacy. Deben escribir primero pruebas de caracterización (`test/characterization.test.js`) para capturar el comportamiento antes del refactor.
   * Una vez cubiertos los casos principales, guíalos a desacoplar en módulos limpios:
     - `src/domain/discounts.js`
     - `src/domain/taxCalculator.js`
     - `src/domain/orderValidator.js`
     - `src/infrastructure/inMemoryInventory.js`

---

## 💡 Preguntas de Cierre para el Debriefing (15 min)
* ¿Qué cuadrante de Martin Fowler representó la Ronda 1? *(Deliberada y Temeraria).*
* ¿Por qué el principio de Abierto/Cerrado (OCP) de SOLID hubiese evitado el conflicto en Git? *(Si las reglas de descuento estuvieran en clases/funciones separadas o usando el patrón Strategy, cada equipo habría creado un archivo nuevo sin tocar el core).*
* ¿Cómo se relaciona la experiencia con la norma **ISO/IEC 25010**? *(Baja modularidad = alta fragilidad y baja modificabilidad).*
