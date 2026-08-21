# Me Fui de Argentina — estado del proyecto

Última actualización: 21 de agosto de 2026.

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
