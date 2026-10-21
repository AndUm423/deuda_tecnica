# Taller Autónomo (Para Casa): «Auditoría Forense y Modernización con CI/CD Quality Gates»
**Especialización en Ingeniería de Software**

---

## 📋 Resumen del Proyecto
* **Modalidad:** Equipos de 2 personas o individual.
* **Tiempo estimado de dedicación:** 1 a 2 semanas.
* **Entregable:** Repositorio en GitHub con el código refactorizado, suite de pruebas, pipeline de GitHub Actions activo y un Informe Técnico de Auditoría en Markdown (`INFORME_AUDITORIA.md`).

---

## 🏢 Escenario Empresarial Ficticio
La fintech **«FastPay Global»** procesa suscripciones y cobros recurrentes a través de un microservicio en Node.js. En los últimos tres meses, el servicio ha sufrido caídas los fines de semana, quejas de clientes por cobros duplicados y una rotación de desarrolladores del 60%. La dirección de tecnología ha congelado nuevos despliegues hasta que se presente una auditoría formal y se refactorice el sistema bajo estándares **ISO/IEC 25010** e **ISO/IEC/IEEE 12207**.

Tu equipo ha sido contratado como Consultores de Arquitectura de Software para sanear el servicio y blindar el pipeline de despliegue.

---

## 🎯 Fases del Taller

### 🔍 Fase 1: Diagnóstico Forense y Medición Cuantitativa (30% de la nota)
1. **Análisis Estático de Código:**
   * Configurar **ESLint** con reglas estrictas (o el plugin `eslint-plugin-sonarjs`).
   * Ejecutar análisis de dependencias vulnerables con `npm audit`.
2. **Inventario de Deuda Técnica:**
   * Medir la **Complejidad Ciclomática y Cognitiva** de las funciones más densas.
   * Identificar y clasificar al menos 5 Code Smells críticos (ej. *God Method*, *Feature Envy*, *Primitive Obsession*, *Shotgun Surgery*, *Dead Code*).
3. **Informe Ejecutivo (`INFORME_AUDITORIA.md`):**
   * Redactar un diagnóstico que incluya el cálculo estimado del **TDR (Technical Debt Ratio)**:
     $$\text{TDR} = \frac{\text{Costo de Remediación Estimado}}{\text{Costo Total de Desarrollo}} \times 100$$
   * Mapear cada hallazgo contra las subcaracterísticas de calidad de **ISO/IEC 25010** (Mantenibilidad: Modularidad, Reusabilidad, Analizabilidad, Modificabilidad y Testeabilidad).

---

### 🏗️ Fase 2: Modernización y Refactorización Arquitectónica (40% de la nota)
1. **Adopción de Arquitectura Hexagonal (Puertos y Adaptadores):**
   * Reorganizar la estructura de carpetas:
     ```text
     src/
     ├── domain/           # Entidades, reglas de negocio puras, sin dependencias externas
     ├── application/      # Casos de uso / Servicios de aplicación
     ├── ports/            # Interfaces o contratos (repositorios, pasarelas de pago)
     └── infrastructure/   # Adaptadores HTTP (Express), base de datos, SDKs externos
     ```
2. **Inversión de Control y Desacoplamiento:**
   * La lógica de facturación y cálculo no debe depender de Express, ni de archivos JSON, ni de librerías de terceros.
3. **Suite de Pruebas Automatizadas:**
   * Cobertura de pruebas unitarias superior al **80%** en la capa de dominio y aplicación.
   * Pruebas de integración para los adaptadores.

---

### 🛡️ Fase 3: Quality Gates Automatizados en GitHub Actions (30% de la nota)
1. Configurar un flujo de trabajo CI en `.github/workflows/quality-gate.yml`.
2. El pipeline debe activarse en cada `push` y `pull_request` a la rama `main`:
   * **Paso 1:** Verificación de sintaxis y linter (`npm run lint`).
   * **Paso 2:** Auditoría de seguridad de dependencias (`npm audit --audit-level=high`).
   * **Paso 3:** Ejecución de pruebas unitarias y cálculo de cobertura (`npm test -- --coverage`).
   * **Paso 4:** Fallar el pipeline si la cobertura es inferior al **80%** o si existen violaciones críticas.
3. Evidenciar en el informe una captura de pantalla del Pull Request bloqueado ante un fallo intencional y aprobado cuando el código cumple todos los Quality Gates.

---

## 📑 Rúbrica de Evaluación (ISO/IEC 25010)

| Criterio | Excelente (5.0) | Aceptable (3.5 - 4.0) | Insuficiente (< 3.0) |
| :--- | :--- | :--- | :--- |
| **Diagnóstico Forense (ISO 25010)** | Documenta hallazgos con métricas cuantitativas (complejidad, TDR, CVEs) y mapeo riguroso a ISO 25010. | Identifica code smells generales pero sin métricas cuantitativas ni rigor metodológico. | Informe superficial o ausencia de diagnóstico formal. |
| **Diseño y Modularidad** | Separación estricta en capas (Hexagonal/Clean); lógica de dominio 100% pura y desacoplada. | Modularización básica pero persisten acoplamientos entre controladores y negocio. | Código en un solo archivo o simplemente dividido en funciones sin arquitectura clara. |
| **Testeabilidad y Cobertura** | Cobertura > 80% demostrada; pruebas unitarias deterministas sin efectos secundarios. | Cobertura entre 60% y 79%, o pruebas frágiles dependientes de estado global. | Cobertura < 60% o pruebas triviales que no validan reglas de negocio. |
| **CI/CD Quality Gate** | Workflow funcional en GitHub Actions que bloquea formalmente merges que no superen el umbral. | Pipeline configurado pero solo corre tests sin verificar umbrales de cobertura ni linters. | Pipeline roto, ausente o sin evidencia de bloqueo. |

---

## 🚀 Entregables
1. Enlace al repositorio GitHub público o con permisos para el docente.
2. Archivo `INFORME_AUDITORIA.md` en la raíz del repositorio.
3. Demostración de al menos un Pull Request cerrado satisfactoriamente con todos los checks verdes de GitHub Actions.
