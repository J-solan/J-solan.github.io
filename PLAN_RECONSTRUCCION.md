# Plan para rehacer el portfolio

**Estado:** implementado y revisado.  
**Fecha:** 18 de septiembre de 2026.  
**Resultado:** plan aprobado e implementado con subagentes y goal. La publicación sigue fuera de alcance.

## 1. Qué queremos conseguir

Una web que permita conocerte un poco y explorar lo que has ido haciendo. Con una voz cercana, proyectos fáciles de encontrar y una estructura que puedas ampliar cuando publiques trabajos del máster o personales.

La reconstrucción parte de cero en diseño, organización y código de presentación. El material de los proyectos actuales se conserva.

### Decisiones que ya has tomado

- El CV desaparece de la web: enlaces, descarga y archivos accesibles. `CV_JSolan.pdf` sirve únicamente como referencia privada para redactar.
- `pibes/` queda completamente fuera del nuevo proyecto.
- Se mantienen los cinco proyectos actuales. No se inventan ni se añaden nuevos proyectos en esta fase.
- Las dos páginas de Unizar reciben la nueva estética.
- Los tres cuadernos del máster se conservan como documentos estáticos.
- Se abandona la estética de neón y el texto genérico que intenta sonar excesivamente profesional.
- Git, el historial y la reconstrucción del repositorio quedan fuera de este plan.
- Antes de implementar, revisamos este documento.

El recorrido, la dirección visual y la base técnica que siguen son **propuestas**, todavía ajustables.

## 2. Lo que hay y conviene corregir

Revisión realizada sobre los archivos locales y el contenido del nuevo CV; todavía no es una comprobación visual en navegador.

| Hallazgo | Consecuencia para la reconstrucción |
| --- | --- |
| La portada encadena presentación, sobre mí, trayectoria, competencias y logros antes de llegar a los proyectos. | Acortar la presentación y acercar los proyectos al principio. |
| Se repiten ideas y expresiones como «perfil técnico», «base de sistemas» y «mirada de datos». | Redactar desde hechos concretos, en primera persona y con frases naturales. |
| La gráfica decorativa de monitorización incluye valores y estados de ejemplo. | Retirarla. Dar protagonismo al contenido y a imágenes reales de los proyectos. |
| El catálogo aparece en `data/projects.json` y también dentro de `index.html`. Actualmente coinciden. | Dejar una única fuente de contenido, sin tener que sincronizar copias. |
| Las fichas de las prácticas 2 y 3 hablan de regularización y transfer learning, pero sus documentos tratan de redes recurrentes y Transformers. | Corregir títulos, resúmenes y etiquetas del catálogo leyendo los documentos; conservar los cuadernos. |
| Los cuadernos disponibles son exportaciones HTML de Jupyter; no hay originales `.ipynb` en esta carpeta. | Migrar los HTML existentes sin intentar regenerarlos ni ejecutar sus modelos. |
| Hay un CV antiguo en `assets/cv/CV_ES_JorgeSM.pdf` y el nuevo en la raíz. | Excluir ambos de todo lo publicable. Quitar un botón no basta para retirar un archivo accesible por URL. |
| `pibes/index.html` y `pibes/fr.html` siguen existiendo aunque no figuren en la navegación principal. | Eliminar esa sección y sus archivos de la nueva entrega. |

El CV actualizado también cambia el contexto: Oracle ya es una responsabilidad actual, el máster figura como 2024–2027 previsto y el TFM trata de GNN para propiedades de materiales. Estos datos sustituyen a las referencias antiguas cuando sean necesarios. El TFM puede mencionarse como trabajo en curso; **no se convierte en un sexto proyecto publicado**.

## 3. Tono y contenido

### Cómo debería sonar

Español cercano, en primera persona, con vocabulario que usarías al explicar qué haces. Se pueden contar cosas técnicas sin convertir cada frase en un argumento de venta.

- Preferir «trabajo con», «hice», «estoy aprendiendo» o «aquí guardo».
- Explicar qué hace un proyecto antes de enumerar tecnologías.
- Usar datos del CV para comprobar hechos, sin trasladar su estructura ni copiarlo entero.
- Evitar eslóganes, listas interminables de herramientas y frases como «transformar retos en soluciones innovadoras».
- No inventar anécdotas, motivaciones, resultados ni aficiones para dar personalidad al texto.
- No añadir teléfono ni otros datos privados del CV. Mantener como contacto el correo y los perfiles públicos que ya aparecen en la web.

### Borrador de presentación para revisar

> Hola, soy Jorge.
>
> Trabajo con sistemas y uso bastante Python para automatizar tareas. También estoy haciendo el máster en Data Science en la UOC.
>
> Aquí voy guardando proyectos de la carrera, del máster y, cuando los publique, también personales.

Enlace principal: **Ver proyectos**.

### Borrador de «Sobre mí»

> Ahora trabajo en Nologin, entre sistemas, automatizaciones y coordinación del proyecto de Oracle. Sigo metido en la parte técnica: scripts, máquinas virtuales y las incidencias que van saliendo.
>
> En el máster estoy preparando el TFM sobre redes neuronales de grafos para predecir propiedades de materiales. Iré compartiendo por aquí los proyectos que publique.

Son muestras de voz, no textos cerrados. La versión final debe seguir sonando a ti al leerla en voz alta. La información profesional cabe en unos pocos párrafos; los hackatones pueden aparecer como una mención breve si quieres conservarlos. No habrá una sección separada de competencias ni una cronología extensa por defecto.

## 4. Recorrido propuesto

### Inicio: `/`

1. **Cabecera sencilla:** Jorge Solán, Proyectos y Sobre mí. Contacto accesible al final.
2. **Presentación breve:** nombre, unas líneas y acceso al archivo.
3. **Una selección de proyectos:** inicialmente TFG y renderizado en Haskell, con acceso a todos los proyectos. La selección se cambia desde sus datos.
4. **Sobre mí:** contexto actual y un poco de recorrido, sin repetir la introducción.
5. **Contacto:** correo, GitHub y LinkedIn mediante enlaces directos.

El primer proyecto debería aparecer pronto al recorrer la página. Evitar una portada que ocupe toda la pantalla solo con un titular.

### Archivo: `/proyectos/`

Un índice propio, útil también para quien llegue directamente buscando un trabajo.

- Mostrar los cinco proyectos desde el principio, con título claro, una frase, origen y año cuando esté comprobado.
- Usar **Carrera**, **Máster** y, cuando tenga contenido, **Personal**. No mostrar categorías vacías.
- Indicar el formato: página de proyecto o cuaderno HTML.
- Con cinco entradas basta una lista agrupada y fácil de recorrer. Búsqueda, paginación y filtros avanzados quedan para cuando el volumen lo justifique.
- Ordenar de forma consistente por fecha disponible, sin inventar meses o días. Los destacados pertenecen a la portada y no alteran el orden del archivo.

### Lectura de un proyecto

Las páginas de Unizar tendrán un regreso visible al archivo al principio y al final, un resumen breve, contenido técnico y recursos bien identificados.

Los notebooks se abrirán mediante un enlace directo **«Abrir cuaderno»**, identificado como HTML estático. Se mantiene la navegación normal del navegador para volver al archivo. No necesitan una página intermedia vacía ni un visor incrustado.

Conservar las cinco rutas actuales de proyectos para que los enlaces guardados sigan funcionando. Esto no implica conservar el diseño ni la organización interna del código.

## 5. Dirección visual propuesta

**Una página personal de lectura y un archivo cuidado.** La personalidad saldrá de la tipografía, el espacio, los textos y el material real de los proyectos.

- Fondo claro cálido, texto oscuro y un único acento apagado, por ejemplo terracota. La combinación exacta se comprobará por contraste.
- Títulos con una tipografía con carácter y cuerpo de texto muy legible. Como máximo dos familias, alojadas localmente si se incorporan fuentes.
- Nombre visible como firma; no hace falta inventar un logotipo.
- Listas, separadores finos y composiciones abiertas. Evitar que cada párrafo viva dentro de una tarjeta.
- Fuera los brillos, fondos de rejilla, degradados decorativos, paneles de monitorización ficticios y animaciones continuas.
- Imágenes de los propios trabajos cuando expliquen algo. Revisar los GIF existentes antes de reutilizarlos y describir correctamente qué muestran.
- En móvil, lectura en una columna y navegación corta, con enlaces fáciles de pulsar.
- Movimiento discreto, foco de teclado visible y respeto por la preferencia de reducir animaciones.

**Propuesta para la primera versión:** un único tema claro bien resuelto. El modo oscuro sería una ampliación posterior si te interesa. El cambio debe notarse en la composición y el recorrido, además de en el color.

## 6. Tratamiento de los proyectos actuales

| Proyecto y ruta conservada | Trabajo previsto |
| --- | --- |
| TFG · `projects/unizar/tfg/` | Nueva presentación y plantilla de lectura; conservar contenido técnico, repositorio y enlace a la memoria. Revisar material visual disponible. |
| Renderizado en Haskell · `projects/unizar/haskell-rendering/` | Misma familia visual que el TFG; distinguir Path Tracing y Photon Mapping y mantener ambos PDF y el repositorio. |
| Práctica 1 · `projects/master/deep-learning/practica-1/` | Mantener el HTML. Ficha centrada en clasificación de imágenes satelitales con redes convolucionales. |
| Práctica 2 · `projects/master/deep-learning/practica-2/` | Mantener el HTML. Corregir la ficha para explicar redes recurrentes, series temporales y texto. |
| Práctica 3 · `projects/master/deep-learning/practica-3/` | Mantener el HTML. Corregir la ficha para explicar Transformers con PyTorch, generación de texto y atención. |

En Unizar, el cambio principal es de presentación. Se puede aligerar la introducción y ordenar mejor las explicaciones, conservando significado, autoría y resultados. No añadir resultados, tiempos o conclusiones sin respaldo.

Los tres HTML de notebooks se copiarán sin modificaciones y se comprobará que coinciden con los originales. Sus estilos quedarán aislados de los del portfolio. Se revisará también la carga de sus recursos externos, como MathJax, para distinguir posibles fallos previos de problemas introducidos por la migración.

**Se conservan `assets/pathtracer.pdf` y `assets/photonmapping.pdf`.** La retirada del CV no afecta a las memorias de proyectos.

## 7. Base técnica y mantenimiento

### HTML, CSS y JavaScript sin proceso de construcción

La implementación final usa archivos estáticos convencionales. Se puede abrir directamente con Live Server desde Visual Studio Code y GitHub Pages puede publicar la raíz del repositorio.

`data/projects.js` es la única fuente del catálogo. `script.js` construye las listas de la portada y del archivo, mientras que `styles.css` contiene el sistema visual compartido. Las páginas de Unizar y los cuadernos siguen siendo HTML independientes en sus rutas públicas.

No hay dependencias ni tareas de compilación para trabajar con la web.

### Organización orientativa

```text
index.html             Portada
styles.css             Diseño compartido
script.js              Listados y navegación
data/projects.js       Catálogo único
proyectos/index.html   Archivo completo
projects/unizar/       Páginas de proyectos de carrera
projects/master/       Cuadernos HTML del máster
assets/                Imágenes y documentos de proyectos
404.html               Página no encontrada
README.md              Uso y mantenimiento
```

Cada entrada del catálogo contiene título, resumen, categoría, formato, ruta, tecnologías y los datos opcionales de fecha y selección para portada.

Los proyectos todavía privados no se introducen en el árbol publicable. Cuando publiques uno nuevo, bastará con añadir su objeto al catálogo y su HTML o cuaderno en `projects/`; no habrá que editar la portada ni el archivo.

### Límite entre material privado y web

El nuevo CV se utilizó únicamente como referencia durante la redacción y se retiró después. También se eliminaron el CV antiguo y todo `pibes/`.

Ocultar enlaces o añadir `noindex` no sustituye a retirar archivos privados. Este documento de trabajo tampoco forma parte de las páginas enlazadas.

## 8. Implementación realizada con goal y subagentes

La implementación comenzó después de revisar el plan y recibir la indicación de continuar, con este goal:

> Reconstruir el portfolio según el plan revisado, con tono cercano, una nueva dirección visual, un archivo ampliable con los cinco proyectos actuales, páginas de Unizar renovadas y notebooks conservados; excluir CV y pibes, y entregar una versión local comprobada con instrucciones de mantenimiento.

La publicación no forma parte de este goal inicial.

### Fases y reparto

| Fase | Responsable | Entrega |
| --- | --- | --- |
| 1. Preparar la base | Agente principal | Inventario de conservación, huellas de los notebooks, estructura, rutas, contrato de datos y plantilla compartida. |
| 2. Contenido | Subagente de contenido | Textos cercanos y cinco fichas fieles a sus fuentes; trabaja en los archivos de contenido. |
| 2. Diseño e inicio | Agente principal | Estilos, componentes comunes, portada y archivo. |
| 2. Páginas de Unizar y material estático | Subagente de proyectos | Adaptación de ambas páginas y migración del material conservando rutas; usa la plantilla acordada. |
| 3. Revisión independiente | Subagente de revisión | Revisión de navegación, móvil, accesibilidad, enlaces y exclusión de material privado. Informa de defectos concretos. |
| 4. Integración y cierre | Agente principal | Correcciones, comprobaciones finales, README y entrega local. |

Primero se acuerdan nombres, rutas y responsabilidades. Los subagentes trabajan sobre archivos delimitados y no modifican a la vez los estilos globales ni los mismos textos. El agente principal mantiene la coherencia del conjunto y resuelve las dependencias entre tareas.

El goal se marcará completo cuando se cumplan los criterios siguientes, no solo cuando la portada tenga buen aspecto.

## 9. Criterios para darlo por terminado

- [x] La presentación es breve, cercana y coherente con el CV actualizado.
- [x] Los proyectos aparecen pronto y el archivo completo se alcanza desde la navegación principal.
- [x] Existen exactamente los cinco proyectos actuales, con descripciones que coinciden con su contenido.
- [x] Las dos páginas de Unizar comparten diseño y conservan sus recursos y rutas.
- [x] Los tres notebooks coinciden con sus originales y se pueden abrir y leer.
- [x] Añadir un proyecto requiere su ficha y sus archivos, sin editar plantillas o duplicar catálogos.
- [x] El nuevo CV y el antiguo quedan fuera de los archivos publicables; sus antiguas URL no sirven un PDF en la versión nueva.
- [x] `pibes/` y sus dos páginas no existen en la salida ni tienen enlaces residuales.
- [x] Se conservan los PDF de proyectos y se comprueban los enlaces locales; se informa de cualquier enlace externo inaccesible.
- [x] Inicio, archivo y páginas de Unizar se revisan en móvil y escritorio, con teclado, foco visible y contraste suficiente.
- [x] El contenido principal y los enlaces están disponibles sin depender de JavaScript para cargar el catálogo.
- [x] La construcción termina correctamente y se comprueba la salida que se publicaría, no solo el servidor de desarrollo.
- [x] El README explica cómo previsualizar, generar y añadir un proyecto con un ejemplo breve.

No hace falta una batería extensa de pruebas para los textos o los colores. Sí comprobaciones concretas de rutas, catálogo, conservación de los notebooks y ausencia de archivos privados en la entrega.

## 10. Puntos para revisar contigo

1. **La voz:** si los borradores de presentación y sobre mí te representan o los quieres aún más informales.
2. **La estética:** si encaja la dirección clara, tipográfica y con acento terracota; especialmente la propuesta de empezar con un solo tema.
3. **El recorrido:** portada corta y archivo independiente, con TFG y Haskell como selección inicial.
4. **La base técnica:** HTML, CSS y JavaScript que funcionan directamente con Live Server y GitHub Pages.

Con esos ajustes, el documento queda preparado para convertirse en trabajo de implementación con el goal y el reparto anteriores.
