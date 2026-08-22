# Me Fui de Argentina — estado del proyecto

Última actualización: 22 de agosto de 2026.

## Dirección visual v20

- Rediseño visible del sitio público con una estética editorial, mediterránea y más reconocible como marca.
- Nuevo hero con mensaje de comunidad, ilustración propia Argentina–Valencia y tarjetas flotantes.
- Navegación simplificada, nueva marca gráfica y llamados a la acción más claros.
- Accesos por categoría, anuncios, grupos, test, negocios, servicios y formulario unificados bajo el mismo sistema visual.
- Mayor contraste entre secciones para que la página tenga ritmo y no se sienta como una sucesión de tarjetas blancas.
- Diseño responsive revisado para móvil, tablet y escritorio.

## Pulido visual y experiencia v21

- Metadatos sociales y descripción de la web preparados para compartir enlaces.
- Nueva sección “De recién llegado a sentirte en casa” con recorrido en tres pasos.
- Barra de progreso al recorrer la página y navegación activa según la sección visible.
- Animaciones de entrada suaves con respeto a la preferencia de movimiento reducido.
- Estados de carga y error visibles para anuncios y grupos.
- Navegación inferior móvil con accesos a Explorar, Grupos y Publicar.
- Footer ampliado con accesos útiles y una estructura más profesional.
- Mejora de accesibilidad en menús, asistente y modal de reportes.
- Corrección del formato de precios para evitar añadir euros a textos como “Jornada completa”.

## Posicionamiento y confianza v22

- El hero presenta a Valencia como la primera ciudad activa dentro de una comunidad nacional en expansión.
- Los estados sin anuncios o grupos ofrecen acciones útiles para quitar filtros, reintentar o publicar.
- Nueva sección de confianza con moderación, advertencia sobre pagos y sistema de reportes.
- Aviso antiestafa visible: verificar identidad, condiciones y existencia antes de transferir una reserva.
- La sección de servicios funciona como convocatoria para captar los primeros profesionales, con contacto directo por Instagram.

## Publicaciones y asistente v23

- Las categorías de las publicaciones mantienen la misma posición con o sin fotografías.
- La red profesional comunica su estado como “próximamente en Valencia” y evita el tono institucional de “convocatoria abierta”.
- Nuevo asistente conversacional beta con campo de texto, detección de necesidades y accesos contextuales a vivienda, trabajo, grupos, publicación, ciudades, seguridad y servicios.
- El asistente funciona sin exponer claves privadas ni atribuirse capacidades de IA generativa que todavía no tiene.

## Producto, SEO y confianza v24

- Las publicaciones tienen ficha completa, galería, enlace individual para compartir y visual propia cuando no hay fotografía.
- El formulario permite previsualizar y quitar imágenes, las optimiza antes de subirlas y comunica cada estado del envío.
- Se informa antes de publicar que los datos de contacto serán públicos y se requiere aceptar las normas.
- Nueva guía útil y preguntas frecuentes sobre la primera comunidad activa en Valencia, con datos estructurados para buscadores.
- Añadidos favicon, manifiesto, robots.txt y sitemap.xml.
- Nueva página de normas y privacidad básica, señalando expresamente los datos legales pendientes y las fuentes oficiales consultadas.
- El panel de administración escapa el contenido enviado por usuarios, muestra estadísticas, imágenes, reportes y permite cerrar sesión.
- No se añade analítica publicitaria ni se afirma cumplimiento legal completo mientras falten identidad pública del responsable, plazos y revisión profesional.

## Servicios y lugares argentinos v25

- Las publicaciones sin imagen muestran un mensaje adaptado: vivienda y compraventa indican la ausencia de foto, mientras trabajo y eventos se presentan por su tipo sin sugerir que falta contenido.
- La futura red profesional suma inmobiliarias y servicios de búsqueda de vivienda, además de seguros.
- Nuevo directorio local en preparación para tiendas argentinas y latinas, mate y productos argentinos, restaurantes, cafeterías, emprendimientos y comercios.
- El directorio no inventa fichas ni recomendaciones: empezará por Valencia y publicará lugares reales a medida que sean revisados.
- Se deja definida la diferencia futura entre ficha normal, destacada, patrocinada y recomendada.
- El asistente reconoce consultas sobre inmobiliarias, seguros, tiendas, mate, productos y gastronomía argentina.

## Mensaje del directorio v26

- Se elimina del sitio público la explicación interna sobre tipos de fichas comerciales.
- El cierre del directorio invita de forma simple a recomendar lugares reales para la guía de Valencia.

## Acabado visual y sensorial v27

- Nuevo sistema coherente de iconos vectoriales para navegación, categorías, grupos, servicios, beneficios y asistente, reduciendo la dependencia de emojis del dispositivo.
- Tarjetas de publicaciones con color por categoría, imágenes más expresivas, jerarquía refinada, descripciones acotadas y respuestas táctiles más claras.
- Contador de resultados y barra de filtros móvil fija, desplazable y pensada para navegar con el pulgar.
- Ficha de publicación móvil reforzada como panel inferior, con animación breve, tirador visual y transiciones respetuosas con la preferencia de movimiento reducido.
- Estados de carga, vacío, botones, grupos, chat y confirmaciones reciben microinteracciones consistentes sin añadir sonidos ni efectos invasivos.
- Se mantiene el comportamiento actual de publicación, moderación, filtros, contacto, reportes y enlaces compartibles.

## Enlaces y tecnología

- Web pública: https://mefuideargentina.github.io/
- Repositorio: `mefuideargentina/mefuideargentina.github.io`
- Frontend estático: `index.html`, `styles.css` y `app.js`.
- Administración: `admin.html`.
- Backend, autenticación, base de datos e imágenes: Supabase.
- Despliegue: GitHub Pages.

## Funciones terminadas

- Anuncios públicos cargados desde Supabase y filtrados por categoría y ciudad.
- Formulario público con moderación: cada anuncio se guarda como `pendiente`.
- Hasta tres fotos por anuncio, máximo 1 MB por imagen.
- Panel de administración con acceso por Supabase Auth para aprobar o rechazar.
- Anuncios destacados durante siete días, ordenados primero y diferenciados visualmente.
- Directorio de grupos de WhatsApp cargado desde Supabase; Valencia está activa.
- Filtros por temática para grupos.
- Test «¿Qué ciudad de España va más con vos?» con siete resultados posibles.
- Secciones «Para negocios» y «Servicios recomendados» preparadas para monetización.
- Asistente flotante con accesos directos a vivienda, trabajo, grupos, publicación, test y negocios.
- Menú móvil.
- Enlaces públicos a Instagram y TikTok `@mefuideargentina`.
- Sistema real de reportes: modal público y guardado en la tabla `reportes`.

## Decisiones de producto y marca

- Audiencia: argentinos que viven en España o están por llegar.
- Tono: cercano, argentino, simple, directo y «sin vender humo».
- Prioridad: experiencia mobile-first y validación con inversión inicial mínima.
- No publicar el WhatsApp personal. Más adelante usar un número separado con WhatsApp Business.
- Hablar de «comunidad moderada» y «publicaciones revisadas»; no prometer seguridad absoluta.
- Distinguir siempre «destacado/patrocinado» de «verificado/recomendado».
- Dirección visual: más identidad, profundidad y sensación de producto; inspiración general en Argentum sin copiarla.

## Monetización prevista

- Anuncios destacados y posible `bump`.
- Profesionales o servicios destacados.
- Membresías/recomendados para negocios.
- Reseñas y contenido para comercios mediante canje o pago.
- Contacto directo y beneficios premium para negocios.

## Próximos pasos recomendados

1. Revisar la nueva dirección visual en móvil y escritorio con contenido real.
2. Añadir aviso legal, privacidad, cookies, términos, normas de publicación y disclaimer antiestafas.
3. Mejorar el panel administrativo para gestionar reportes y grupos con más comodidad.
4. Añadir estados de carga/error y validaciones más claras en los formularios.
5. Preparar WhatsApp Business y rellenar servicios/grupos antes de una difusión fuerte.
6. Revisar LSSI, RGPD, LOPDGDD, DSA, pagos, fiscalidad y contenido patrocinado antes de monetizar.

## Notas para retomar

- La clave pública de Supabase puede estar en el frontend; la seguridad depende de las políticas RLS.
- No borrar ni sustituir las políticas RLS sin revisar primero el flujo público y el de administración.
- Mantener los parámetros de versión de `styles.css` y `app.js` en `index.html` cuando se publique un cambio, para evitar caché antigua.
- Antes de modificar datos reales, probar primero con un anuncio o reporte de prueba y eliminarlo después.
