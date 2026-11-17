# 📋 TODO: Plan Exacto para Terminar el Portafolio y CMS

Este documento detalla el estado actual del proyecto, los errores que impiden su funcionamiento completo y los pasos exactos en orden para terminarlo.

---

## 🚨 Fase 1: Configuración de Entorno y Backend (Bloqueantes Críticos)

Actualmente el servidor backend (`backend/index.js`) no puede conectarse a MongoDB ni subir imágenes a Cloudinary porque el archivo `.env` no está en el repositorio.

- [ ] **1.1. Crear el archivo `backend/.env`** con tus credenciales reales:
  ```env
  PORT=3000
  MONGODB_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/portafolio?retryWrites=true&w=majority
  CLOUDINARY_CLOUD_NAME=tu_cloud_name
  CLOUDINARY_API_KEY=tu_api_key
  CLOUDINARY_API_SECRET=tu_api_secret
  ```
- [ ] **1.2. Agregar scripts de ejecución en `backend/package.json`**:
  Añadir en la sección `"scripts"`:
  ```json
  "start": "node index.js",
  "dev": "node --watch index.js"
  ```
- [ ] **1.3. Añadir endpoint por `slug` (o filtro por `slug`) y `DELETE` en `backend/index.js`**:
  - Agregar soporte en `GET /api/posts` para filtrar también por `slug` (o crear `GET /api/posts/slug/:slug`) para que la vista pública `/blog/[slug]` funcione en modo SSR sin depender de `getStaticPaths`.
  - (Opcional) Agregar `DELETE /api/posts/:id` para poder borrar artículos de prueba desde el panel `/admin`.
- [ ] **1.4. Eliminar o proteger la ruta temporal `/api/crear-prueba`** en `backend/index.js` antes de pasar a producción.

---

## 🛠️ Fase 2: Terminar el Panel de Administración (`/admin`)

### Cómo quedó `/admin` hasta ahora:
1. **`src/pages/admin/preview/[id].astro` (Completado ✅):**
   - Funciona con SSR (`export const prerender = false`).
   - Consulta `GET http://localhost:3000/api/posts/${id}` validando que la respuesta sea JSON.
   - Inyecta las variables CSS dinámicas (`bgColor`, `textColor`, `titleFont`) con `<style define:vars={{...}}>` y renderiza estado, título, tecnologías, imagen de portada, resumen, contenido e imagen de contenido.
2. **`src/pages/admin/index.astro` (Incompleto ⚠️):**
   - Solo tiene el formulario `#post-form` para crear artículos (`POST /api/posts` con `FormData`).
   - Aunque el botón dice *"Publicar Artículo"*, el backend lo guarda con `status: 'draft'` (borrador) por defecto.
   - **Falta toda la sección de gestión de artículos (pestañas y acciones).**

### Pasos para completar `src/pages/admin/index.astro`:
- [ ] **2.1. Activar SSR en `/admin`**:
  - Añadir `export const prerender = false;` en el frontmatter de `src/pages/admin/index.astro`.
- [ ] **2.2. Ajustar textos del formulario de creación**:
  - Cambiar el texto del botón de *"Publicar Artículo"* a *"Guardar como Borrador"* (o añadir un `<select name="status">` si deseas elegir el estado al crearlo) y refrescar la lista de borradores tras guardar.
- [ ] **2.3. Construir el sistema de Pestañas (Tabs) por estado**:
  - Debajo (o al lado) del formulario, crear 3 pestañas:
    1. **Borradores (`draft`)** — activa por defecto.
    2. **Publicados (`published`)**.
    3. **Archivados (`archived`)**.
  - Consumir `GET http://localhost:3000/api/posts?status=<estado>` al cargar la página y al cambiar de pestaña.
- [ ] **2.4. Renderizar la tabla/lista de artículos con botones de acción**:
  Para cada artículo listado en la pestaña activa, mostrar título, fecha, tecnologías y los siguientes botones:
  - 👁️ **Ver Vista Previa:** Enlace `<a href={`/admin/preview/${post._id}`}>Vista Previa</a>`.
  - 🚀 **Publicar** (visible en Borradores/Archivados): Botón que ejecuta `PUT http://localhost:3000/api/posts/${post._id}` con body `JSON.stringify({ status: 'published', publishedAt: new Date() })`.
  - 📦 **Archivar** (visible en Publicados/Borradores): Botón que ejecuta `PUT http://localhost:3000/api/posts/${post._id}` con body `JSON.stringify({ status: 'archived' })`.
  - 📝 **Mover a Borrador** (visible en Publicados/Archivados): Botón que ejecuta `PUT http://localhost:3000/api/posts/${post._id}` con `{ status: 'draft' }`.

---

## 🌐 Fase 3: Corregir el Blog Público y el Home (`/blog` y `/`)

Actualmente las páginas públicas tienen errores que impiden que el flujo de publicación y los estilos dinámicos se reflejen en el sitio real.

- [ ] **3.1. Filtrar solo artículos publicados (`?status=published`) en las vistas públicas**:
  - En `src/pages/index.astro`: Cambiar el fetch a `http://localhost:3000/api/posts?status=published` y validar `Array.isArray(allPosts)` antes de hacer `.slice(0, 2)` (actualmente lanza error si el backend devuelve un error).
  - En `src/pages/blog/index.astro`: Cambiar el fetch a `http://localhost:3000/api/posts?status=published` (actualmente muestra también los borradores y archivados).
- [ ] **3.2. Añadir `export const prerender = false;` en las páginas dinámicas**:
  - Agregar `export const prerender = false;` en `src/pages/index.astro`, `src/pages/blog/index.astro` y `src/pages/blog/[slug].astro` para que consulten MongoDB en tiempo real sin requerir reconstruir (`astro build`) cada vez que publiques un post.
- [ ] **3.3. Actualizar `src/pages/blog/[slug].astro` con SSR y estilos dinámicos**:
  - Reemplazar `getStaticPaths()` por SSR (`export const prerender = false;`) obteniendo `const { slug } = Astro.params;` y buscando el post publicado con ese `slug`.
  - Aplicar los estilos personalizados del post (`bgColor`, `textColor`, `titleFont`), las etiquetas de `technologies` y las imágenes de Cloudinary (`coverImage` y `contentImage`), igual que en `src/pages/admin/preview/[id].astro`.
- [ ] **3.4. Restaurar las secciones Hero y Tecnologías en `src/pages/index.astro`**:
  - En `src/pages/index.astro` quedó el comentario `<!-- (Mantén tu sección HERO y TECNOLOGÍAS igual) -->`. Hay que restaurar o maquetar la presentación principal de tu portafolio encima de la sección "Últimos Artículos".

---

## 🧹 Fase 4: Limpieza y Producción

- [ ] **4.1. Limpiar dependencias no utilizadas**:
  - En `package.json` del frontend aún figura `"@sanity/image-url": "^2.1.1"`, que ya no se usa tras migrar a Cloudinary/MongoDB.
- [ ] **4.2. Extraer la URL del backend a una variable de entorno en Astro**:
  - Reemplazar las URLs hardcodeadas `http://localhost:3000` por `import.meta.env.PUBLIC_API_URL || 'http://localhost:3000'` en todas las páginas de Astro para facilitar el despliegue en producción.
- [ ] **4.3. Proteger la ruta `/admin` (Futuro / Producción)**:
  - Actualmente cualquier persona que entre a `/admin` puede crear o publicar posts. Antes de subir a internet, añadir autenticación básica o con token/sesión.
