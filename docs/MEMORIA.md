---
type: Memoria
title: Memoria del proyecto — Recordatorios Fisioanimal
description: Síntesis del proyecto en lenguaje entendible, con tecnicismos explicados
tags: [memoria, sintesis, bootcamp]
generated:
  by: opencode
  at: 2026-08-27
status: stable
---

# Memoria — Recordatorios Fisioanimal

> Documento de síntesis. Cuenta la historia del proyecto de principio a fin en lenguaje claro. Para el detalle técnico, ver `docs/okf/`.

---

## 1. El problema

Andrea es fisioterapeuta canina. Agenda sus citas en Google Calendar poniendo el **nombre del perro** como título del evento. El problema: sus clientas olvidaban las citas o llegaban con desfase, porque **nadie les enviaba un recordatorio**.

Hacerlo a mano era inviable: cada día revisar el calendario, buscar el teléfono de cada tutora, escribirle… tiempo que Andrea no tiene. Hacía falta un sistema que **leyera el calendario y avisara solo**, sin que ella moviera un dedo.

---

## 2. La solución

Construí un sistema de recordatorios automáticos por email que vive **100% dentro de Google**, sin servidores externos y sin coste.

**Término → qué es cada pieza:**

- **Google Apps Script** → el "motor" de automatización de Google. Es código que se ejecuta dentro de Google (no en tu ordenador) y puede manejar tu Calendar, tu Sheets, tu Gmail y tu Drive a la vez.
- **Calendar** → donde Andrea apunta las citas (el título del evento = nombre del perro).
- **Sheets** → la base de datos: una hoja con cada perro, su tutora, su email.
- **Gmail** → envía los recordatorios.
- **Drive** → guarda el logo que va incrustado en el correo.

**Cómo funciona (el flujo):**

1. Andrea crea una cita en Calendar con el nombre del perro.
2. Dos veces al día (a las 10:00 y a las 20:00) Apps Script se ejecuta **solo** — gracias a unos **triggers** (disparadores: como alarmas que programas una vez y suenan solas cada día).
3. El script lee las citas de **mañana** del Calendar.
4. Para cada cita, busca el perro en la hoja Sheets y saca el email de la tutora.
5. Le envía un email en HTML (texto con formato) con el logo, la fecha y la hora.
6. Anota todo en una hoja "Log" y manda un resumen a quien gestiona el sistema.

**Analogía:** es como tener un asistente invisible que, dos veces al día, mira la agenda de mañana y llama a cada clienta para recordarle la cita. Solo que en vez de llamar, envía un email con el logo.

---

## 3. Decisiones clave

### ¿Por qué Google Apps Script y no n8n u otras herramientas?

Se evaluaron: n8n (Cloud y self-hosted), Make y Zapier. Se eligió Apps Script por:

1. **Coste cero para siempre** — sin servidor, sin suscripción.
2. **Cero mantenimiento** — Google gestiona servidores, actualizaciones y certificados.
3. **Andrea ya usa Google** — no tiene que aprender nada nuevo; sigue abriendo Calendar como siempre.
4. **Un solo ecosistema** — no hay que conectar servicios externos (menos puntos de fallo).

La contrapartida: límite de 500 emails/día en Gmail personal. Para un negocio pequeño de citas, sobrado. Si crece, los datos (Sheets + Calendar) son trasladables a n8n sin empezar de cero.

### ¿Por qué buscar al perro por nombre y no por otra cosa?

Porque es la única información que Andrea apunta de forma natural al crear la cita: pone "Luna" de título. El script usa ese nombre como **clave de búsqueda** contra la hoja. Para que no fallen los emparejamientos por un error de teclado, añadí **fuzzy matching** (búsqueda tolerante a fallos de escritura).

---

## 4. Lo que arreglé por el camino

Esta es la parte más útil para aprender. Un proyecto real no sale bien a la primera; lo importante es detectar los fallos y corregirlos.

### Bug crítico: citas duplicadas que se anulaban
La **deduplicación** (evitar enviar dos veces el mismo recordatorio) se basaba en *nombre del perro + fecha*. El problema: si Andrea tenía a "Luna" a las 10:00 y a "Luna" a las 17:00 el mismo día, el script pensaba que la segunda ya estaba enviada y **la saltaba**. Una clienta se quedaba sin aviso.

**Fix:** la deduplicación ahora usa el **ID de evento** de Calendar (una especie de DNI único de cada cita). Dos citas del mismo perro a distintas horas tienen IDs distintos → se envían ambas.

### Fallos mudos (silenciosos)
Si faltaba una hoja o el ID del logo estaba mal, el script moría sin avisar. Nadie se enteraba hasta que una clienta decía "no me llegó el recordatorio".

**Fix:** un **try/catch** global (una red que captura los errores antes de que rompan todo). Si algo falla, el sistema envía un email de alerta. Para errores que la propia Andrea puede arreglar (renombró la hoja sin querer), el correo le explica en cristiano **qué pasó y cómo arreglarlo ella sola**, sin derivarla a soporte.

### Nombres compuestos cortados
"María José López" se saludaba como "Hola María" (el script cogía solo la primera palabra). En España los nombres compuestos son ubícuos.

**Fix:** una columna nueva "Nombre de pila (saludo)" donde se pone el nombre con el que quieres que empiece el email. Si se rellena, el saludo es correcto; si no, hace **fallback** (usar la primera palabra) para no romper.

### Tests que mentían
Tenía 49 pruebas que pasaban todas en verde, pero **algunas etiquetas no describían lo que de verdad probaban**: un test llamado "1 sustitución" probaba en realidad 0 cambios. Eso da una falsa sensación de seguridad.

**Fix:** revisé cada etiqueta para que describa exactamente lo que prueba. Un test verde que miente es peor que no tener test, porque te hace creer que cubres un caso que no cubres.

### Resumen que solo llegaba si había trabajo
Si un día no había citas, no llegaba el resumen. Así no sabías si "no hay citas" o "el script está caído".

**Fix:** el resumen se envía **siempre**, aunque no haya citas (mensaje: "Hoy no hay citas para mañana"). Si un día no llega, sabes que algo falla.

### Configuración desperdigada
El email, el ID del logo y la zona horaria estaban **hardcoded** (escritos a mano) en varios puntos del código. Cambiarlos requería tocar varias líneas y era fácil olvidarse.

**Fix:** un bloque `CONFIG` al principio con todo junto, que además se puede sobreescribir con **Script properties** (configuración que vive dentro de Google, sin tocar el código). Así, desplegar en la cuenta de Andrea no requiere editar el script.

### Rendimiento del Log
El Log (el historial) se releía entero por cada evento y se escribía fila a fila.

**Fix:** cargar el Log una sola vez en un **Set** (estructura de datos para buscar muy rápido) y escribir todas las filas juntas en una sola operación (**batch**). Para el tamaño actual no cambia nada, pero evita escalar mal.

---

## 5. Estado actual y qué falta

**✅ Fase de pruebas completada (27/08).** El sistema es 100% automático: los triggers disparan solos a las 10:00 y a las 20:00, y el resumen llega sin tocar nada. El núcleo está validado de principio a fin: recordatorios, deduplicación por ID, resumen diario siempre, alerta de error accionable y nombres compuestos.

**⏳ Pendiente: el despliegue en la cuenta de Andrea.** No depende del código, sino de los datos de Andrea (su email, sus clientas reales, el logo en su Drive). Cuando estén, se despliega siguiendo el checklist de `docs/TAREAS-PENDIENTES.md` repitiendo lo que ya se probó.

**Lo que ya no necesita mantenimiento:** el script se ejecuta solo, se autoavisa si algo falla y avisa incluso los días sin citas. Hasta que llegue Andrea, duerme tranquilo.

---

## 6. Aprendizajes (lecciones honestas)

1. **Lo más simple que funciona gana.** Apps Script, sin servidores, en un ecosistema que ya usaban. Sobre-ingeniar con n8n/VPS habría añadido coste y mantenimiento para el mismo resultado.

2. **Los fallos no deben ser mudos.** Un sistema automático que falla en silencio es peor que no tener sistema, porque genera falsa confianza. El `try/catch` con alertas es lo primero que metería en cualquier automatización.

3. **Un test verde que miente es peor que no tener test.** Las etiquetas de los tests deben describir lo que prueban. Si no, la suite te da una sensación de seguridad que no es real.

4. **Diseño a prueba de errores (poka-yoke).** La columna "Nombre de pila" con fallback, el CONFIG con override por Script properties, el resumen que llega siempre… todo son pequeños seguros que hacen que el sistema no se rompa si alguien comete un error humano.

5. **La documentación es parte del producto.** README para empezar, OKF para el detalle técnico, TAREAS para el despliegue y esta memoria para entenderlo de un vistazo. Documentar bien ahorra sufrimiento futuro.

6. **La honestidad sobre el estado del proyecto importa.** "Funcionando en pruebas" no es "en producción". Decirlo claro en el README y en el checklist evita confundir validación con despliegue.

---

## Resumen en una frase

Un sistema de recordatorios por email, gratis y automático, construido íntegramente en Google Apps Script, que ha pasado por una revisión de calidad corrigiendo un bug crítico de deduplicación, blindando los fallos con alertas y dejando la documentación sincronizada con cada cambio.
