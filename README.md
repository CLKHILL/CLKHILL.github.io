# Sistema de inventario de productos por categoría

## Datos de presentación
- **Alumno:** Jesus Gilberto Lucero Sánchez
- **Programa:** Programación web
- **Docente:** Manuel Alejandro Díaz Hernández
- **Fecha de entrega:** 30/10/2026

Proyecto para exentar Programación Web (2026-II).
Hecho con HTML5, CSS3, JavaScript y Supabase.

URL pública: (poner aquí el link de GitHub Pages o Vercel)

## Archivos
- `index.html` - estructura de la página
- `style.css` - estilos (hechos a mano, sin template)
- `app.js` - lógica y conexión con Supabase
- `script.sql` - crea las tablas `categorias` y `productos`

## Cómo ejecutarlo
1. Crear un proyecto gratis en https://supabase.com
2. Ir a **SQL Editor**, pegar el contenido de `script.sql` y darle **Run**
3. Ir a **Project Settings > API** y copiar la **Project URL** y la **anon public key**
4. Pegarlas en las dos primeras constantes de `app.js`
   (nunca usar la `service_role key`, esa es privada)
5. Abrir `index.html` en el navegador (o subir la carpeta a GitHub Pages / Vercel)

## Relación entre tablas
Un producto pertenece a una categoría y una categoría tiene muchos productos
(uno a muchos). Se hace con la llave foránea `productos.categoria_id`
que apunta a `categorias.id`.
Si intentas borrar una categoría con productos, la base de datos no deja
(`on delete restrict`) y la página muestra un mensaje de error.

## Cómo probar cada operación
- **Crear:** llenar el formulario y darle Guardar
- **Consultar:** las tablas se cargan solas al abrir la página
- **Actualizar:** botón Editar, cambiar los datos y Guardar
- **Eliminar:** botón Eliminar y confirmar
- **Validaciones:** dejar campos vacíos o poner precio negativo

## Publicar en GitHub Pages
Subir los archivos a un repositorio, ir a Settings > Pages y elegir la rama `main`.
