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
| 🏠 **Taller 2 (Para Casa)** | *«Auditoría Forense y Quality Gates en CI/CD»*: Proyecto de modernización a Arquitectura Hexagonal con pipeline de GitHub Actions. | [`taller-casa/`](./taller-casa/) |

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

### 2. Para Casa: «Auditoría Forense y Quality Gates» (1 - 2 semanas)
* **Fase 1:** Diagnóstico forense con linters, auditoría de seguridad y cálculo del TDR.
* **Fase 2:** Migración a Arquitectura Hexagonal con cobertura de pruebas unitarias > 80%.
* **Fase 3:** Pipeline de GitHub Actions que bloquea PRs si la calidad o seguridad no cumplen el estándar.
* 👉 Ver enunciado y rúbrica completa en [`taller-casa/GUIA_TALLER_CASA.md`](./taller-casa/GUIA_TALLER_CASA.md).
