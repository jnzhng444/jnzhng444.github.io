# Jian Yong Zheng Wu · Portfolio

Portafolio personal en inglés, preparado para **https://jnzhng444.github.io/**. HTML, CSS y JavaScript modular, sin backend, framework ni compilación obligatoria. Todos los assets son locales. Los proyectos no dependen de la API de GitHub.

Identidad visual: **欢迎 / WELCOME**, negro `#050505`, verde eléctrico `#B6FF3B` y blanco cálido `#F5F5F0`. Inspiración en carteles chinos contemporáneos, con un monograma latino JZ, un chip SVG en capas y dos secciones verdes. El chino se limita a los caracteres correctos de la bienvenida; no se inventó un nombre chino ni una historia familiar.

La bienvenida conserva texto HTML seleccionable y ahora tiene un halo verde permanente con una variación suave de intensidad y un reflejo que recorre los caracteres. El efecto usa CSS, respeta el botón de pausa y se suspende fuera de pantalla; al imprimir se muestra texto negro sin brillo.

Fondos por sección: circuitos en la bienvenida, diagramas de bloques en el compilador, señales digitales en scheduling, trazados en F1, geometría en raíces, capas en About/Skills y conexiones en contacto. Los siete SVG originales de `assets/backgrounds/` suman unos 4,4 KB. Se aplican desde CSS como decoración estática, con menor intensidad en móvil y ocultos al imprimir.

## Probar localmente

Desde la raíz, con Python 3:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Abrí **http://127.0.0.1:8000/**. Usá un servidor HTTP porque JavaScript emplea módulos ES; abrir `index.html` con `file://` no es suficiente. Detené el servidor con Ctrl+C. No se requiere `npm install`.

## Editar contenido

- `index.html`: presentación, About, experiencia, idiomas, certificaciones y contacto; metadatos de buscadores y redes.
- `js/data.js`: fuente central de los ocho proyectos y las habilidades. Cada proyecto define descripción, aporte, tecnologías, detalles, enlace y etiqueta corta del selector (`tabLabel`). Para agregar otro, añadí una entrada a `featuredProjects` y su visual en `projectVisuals`.
- `js/render.js`: composiciones de los proyectos, demostraciones y habilidades; compartidas por el navegador y la copia HTML estática.
- `js/project-visuals.js`: diagramas originales y explicaciones de ChaCha20, señales/control, FPGA/RISC-V, Tarea4Paradigmas y el contexto del compilador dentro del sistema Craft21. Las señales y los indicadores animados son ilustraciones conceptuales, no simulaciones ejecutables.
- `js/raytracing.js`: escena ilustrativa de Ray Tracing y selector de los cinco modelos de ejecución: Sequential, Fine-Grained, Coarse-Grained, SMT y CMP. Los mapas explican orden y distribución del trabajo; no representan tiempos medidos.
- `js/compiler.js`: etapas y ejemplos didácticos del compilador.
- `js/scheduler.js`: algoritmo de la demostración RMS/EDF, exportado para pruebas. Si cambiás las tareas o el horizonte, actualizá también las explicaciones y pruebas; el gráfico y la tabla se calculan a partir del modelo.
- `js/scheduler-view.js`: gráfico SVG y tabla textual calculados desde el mismo modelo RMS/EDF.
- `js/main.js`: mejora progresiva del contenido, selector de proyectos, navegación, demostraciones y copia de correo. Carga las animaciones por separado y tolera su fallo.
- `js/motion.js`: entrada, parallax, visibilidad y pausa. JavaScript nativo; sin GSAP, Three.js, WebGL ni dependencias de ejecución.
- `css/styles.css`: diseño, tamaños adaptables, foco, movimiento reducido y estilos de impresión.
- `assets/`: favicon, tipografías con licencias y PDF público.
- `docs/SOURCES.md`: evidencia, atribución colaborativa y límites de las demostraciones.
- `docs/VERIFICATION.md`: resultados y alcance de la verificación.

El HTML ya incluye todos los proyectos y habilidades. Se puede servir y publicar tal cual. Cuando cambiás `js/data.js`, el navegador usa los datos nuevos; para actualizar también la copia que se muestra **sin JavaScript**, ejecutá el helper de mantenimiento, sin instalar paquetes:

```powershell
node scripts/sync-content.mjs
```

No es un build obligatorio para ejecutar o publicar. `node scripts/sync-content.mjs --check` comprueba si la copia HTML coincide con los datos.

La fuente china local es **Noto Sans SC Black, peso 900**, subconjunto de los dos glifos `U+6B22` y `U+8FCE` (2.384 bytes). La licencia SIL OFL está en `assets/fonts/NotoSansSC-OFL.txt`. Si agregás más texto chino, necesitás ampliar el subconjunto; no conviertas los caracteres en una imagen. Las otras fuentes locales siguen siendo Space Grotesk e IBM Plex Mono. La fuente no se descarga desde Google al visitar la página.

Para actualizar el CV, reemplazá `assets/cv/jian-yong-zheng-wu-cv.pdf` por un PDF real sin teléfono ni otros datos que no quieras publicar. La copia actual se deriva del nuevo `Jian_s_Resume (1).pdf`, con el proyecto **Custom Compiler and RISC Processor System**, eliminando el teléfono del contenido PDF. Los originales que coinciden con `/Jian_s_Resume*.pdf` están ignorados por Git. El comando `python scripts/prepare_cv.py "Jian_s_Resume (1).pdf"` reproduce la eliminación para **ese PDF concreto**, con `pypdf` instalado; si cambia su formato o número, hay que adaptar y revisar el proceso. El sitio no necesita Python ni `pypdf` al publicarse.

## Verificaciones

Con Node.js 22 o superior, sin instalar dependencias del sitio:

```powershell
node --test tests/scheduler.test.mjs
node --check js/main.js
node --check js/data.js
node --check js/compiler.js
node --check js/scheduler.js
node --check js/render.js
node --check js/project-visuals.js
node --check js/raytracing.js
node --check js/scheduler-view.js
node --check js/motion.js
node scripts/sync-content.mjs --check
```

El sitio incluye navegación móvil por teclado, skip link, controles con estado accesible, tabla textual de calendarización, copia de correo con confirmación, pausa temporal en la cabecera y animaciones activas por defecto. El scroll es nativo. Las animaciones ambientales se pausan fuera de pantalla y al ocultar la pestaña; el trabajo de parallax solo ocurre al desplazarse o redimensionar, agrupado en un frame solicitado. No hay un renderizador 3D continuo ni formulario.

Los ocho proyectos comparten una sección: **Ray Tracing**, **Compiler & RISC**, **Real-time systems**, **F1 Garage**, **ChaCha20**, **Signals & control**, **FPGA & RISC-V** y **C + Java game** (Tarea4Paradigmas). Ray Tracing aparece primero y seleccionado al cargar; reemplaza a MPointer. El aporte personal se limita al problema de Ray Tracing y sus modelos de ejecución dentro del proyecto de cuatro problemas. Cada selección muestra su contenido, fondo y diagrama o demo; conserva las etapas, el algoritmo y los detalles abiertos al cambiar. El selector permanece disponible mientras se lee el proyecto y se desplaza horizontalmente en pantallas pequeñas. Se puede usar con clic, toque, botones anterior/siguiente, flechas izquierda/derecha e Inicio/Fin; Tab avanza hacia el panel seleccionado.

La demo del compilador sigue compacta: reproduce sus seis etapas cada 3,4 segundos solo mientras está visible y el movimiento está habilitado. Elegir una etapa detiene la reproducción; **Play stages / Pause stages** permite retomarla o pausarla. La secuencia larga ligada al scroll sigue desactivada. Los bloques representan ejemplos didácticos, no el compilador real. La demo RMS/EDF conserva el cálculo original. Sin JavaScript o al imprimir, los ocho proyectos permanecen visibles como contenido continuo.

La p?gina arranca en **Motion on** en cada visita, independientemente de la preferencia de Windows/navegador y de las opciones guardadas anteriormente. Este comportamiento responde a la preferencia expl?cita del propietario del sitio. El bot?n permite pausar y reanudar durante la visita; al recargar, las animaciones vuelven a activarse. Ya no se leen ni escriben preferencias de movimiento en localStorage. Las escenas fuera de pantalla, los paneles ocultos y la pesta?a en segundo plano siguen suspendiendo el trabajo. Sin JavaScript o si falla el m?dulo de movimiento, el contenido permanece visible y est?tico.

## Publicar en GitHub Pages

Los cambios quedan locales; no se hizo commit, push ni despliegue.

1. Revisá el sitio local, el contenido y el PDF público. Confirmá que el original privado no esté incluido (`git status --short`).
2. Cuando decidas publicarlo, guardá los archivos en un commit y subilos a la rama **main** de **jnzhng444/jnzhng444.github.io**. Si trabajás en otra rama, integrá los cambios a `main` primero.
3. En GitHub, abrí el repositorio → **Settings → Pages**.
4. En **Build and deployment**, elegí **Deploy from a branch**.
5. Elegí la rama **main**, carpeta **/ (root)** y presioná **Save**.
6. Esperá a que termine el trabajo de Pages en **Actions**. Abrí **https://jnzhng444.github.io/**.

`index.html` y `.nojekyll` están en la raíz; las rutas relativas sirven para GitHub Pages. No configures un dominio personalizado ni un directorio `dist`. No hace falta un workflow propio.
