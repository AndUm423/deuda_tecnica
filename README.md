# Deuda Técnica en Software: Diagnóstico, Estándares y Remediación Continua
> **Especialización en Ingeniería de Software**  
> Material académico, diapositivas y talleres prácticos (en clase y autónomo).

---

## 📚 Contenido del Repositorio

| Recurso | Descripción | Ubicación |
| :--- | :--- | :--- |
| 📊 **Presentación Oficial** | Diapositivas completas (15 slides) con estándares ISO, cuadrante de Fowler y métricas SQALE/TDR. | [Deuda Técnica en Software.pptx](./Deuda%20Técnica%20en%20Software.pptx) |
| 🎙️ **Guión y Notas del Ponente** | Transcripción y narrativa recomendada por encabezado. | [Deuda Técnica en Software.txt](./Deuda%20Técnica%20en%20Software.txt) |
| 🧪 **Taller 1 (En Clase)** | *«El Monolito Tóxico»*: Dinámica de 3 rondas en Node.js (fricción de Git, relevo técnico y saneamiento ISO). | [`taller-clase/`](./taller-clase/) |
| 🏠 **Taller 2 (Para Casa)** | *«Auditoría Forense, Gobernanza y Quality Gates en CI/CD»*: Starter kit en Node.js (`fastpay-service`), simulación de cobros duplicados, cálculo financiero de Principal vs. Intereses, Arquitectura Hexagonal y pipeline de GitHub Actions. | [`taller-casa/`](./taller-casa/) |

---

## 🛠️ Puesta en Marcha Rápida (Taller en Clase)

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd deuda_tecnica/taller-clase
   ```

2. **Simular el tráfico sobre el monolito:**
   ```bash
   npm run simulate
   ```

3. **Ejecutar la suite de pruebas nativa:**
   ```bash
   npm test
   ```

---

## 📐 Estándares Internacionales de Referencia

* **ISO/IEC/IEEE 12207:** Procesos del Ciclo de Vida del Software (Gobernanza del mantenimiento y evolución disciplinada).
* **ISO/IEC/IEEE 16326:** Gestión de Proyectos de Software (Presupuestación de riesgos y contención de plazos irreales).
* **ISO/IEC/IEEE 29148:** Procesos de Ingeniería de Requisitos (Trazabilidad y control de ambigüedad para evitar parches de emergencia).
* **ISO/IEC 25010:** Modelo de Calidad del Producto de Software (Mantenibilidad, Modularidad, Reusabilidad, Modificabilidad y Testeabilidad).

---

## 👥 Estructura de Talleres

### 1. En Clase: «El Monolito Tóxico» (60 min)
* **Ronda 1 (20 min) - Presión de Entrega:** Añadir descuentos express directamente en ramas paralelas sin tests ni tipado.
* **Ronda 2 (15 min) - Intercambio a Ciegas:** Relevar la rama del equipo compañero sin comunicación verbal e intentar fusionar (`merge`) a `main`.
* **Ronda 3 (25 min) - Saneamiento ISO 25010:** Congelar comportamiento con **Pruebas de Caracterización** y refactorizar en módulos limpios.
* 👉 Ver guía completa en [`taller-clase/README.md`](./taller-clase/README.md) y [`taller-clase/solucion-guia-docente.md`](./taller-clase/solucion-guia-docente.md).

### 2. Para Casa: «Auditoría Forense, Gobernanza y Quality Gates» (1 - 2 semanas)
* **Starter Kit:** Microservicio de suscripciones [`fastpay-service/`](./taller-casa/fastpay-service/) con bugs de concurrencia y deuda técnica inyectada.
* **Fase 1 - Diagnóstico Forense:** Detección de *code smells*, análisis estático con linter y reproducción de cobros duplicados (`npm run simulate`).
* **Fase 2 - Finanzas de Deuda Técnica:** Cálculo cuantitativo del Principal vs. Intereses a partir de la bitácora histórica (`incidents-history.json`), clasificación en el cuadrante de Martin Fowler y cálculo del TDR e índice de retorno (ROI).
* **Fase 3 - Gobernanza y Priorización:** Matriz Impacto vs. Esfuerzo y registro formal de *Deuda Táctica Deliberada* (Technical Debt Register).
* **Fase 4 - Modernización Hexagonal:** Pruebas de caracterización previas (Golden Master), eliminación de bugs de coma flotante (Value Object) y migración a Puertos y Adaptadores con cobertura $> 80\%$.
* **Fase 5 - CI/CD Quality Gates:** Pipeline en GitHub Actions que bloquea PRs si la cobertura disminuye o se violan los estándares de calidad.
* 👉 Ver guía completa en [`taller-casa/GUIA_TALLER_CASA.md`](./taller-casa/GUIA_TALLER_CASA.md) y plantilla oficial en [`taller-casa/INFORME_AUDITORIA_TEMPLATE.md`](./taller-casa/INFORME_AUDITORIA_TEMPLATE.md).
