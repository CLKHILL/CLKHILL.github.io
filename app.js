// ============================================
// CONEXION CON SUPABASE
// ============================================
// Aqui van los datos de mi proyecto (Supabase > Project Settings > API)
// OJO: solo la URL y la "anon key". NUNCA la service_role key.
const SUPABASE_URL = "https://mkltmghcyxdtzjnzjfog.supabase.co";
const SUPABASE_KEY = "sb_publishable_KzFGbKFGI12cM2y5TSuHxw_XGFdgCMm";

// crea el cliente para hablar con la base de datos
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


// ============================================
// ELEMENTOS DEL HTML (los guardo en variables para no buscarlos cada vez)
// ============================================
const mensaje = document.getElementById("mensaje");

// categorias
const formCategoria = document.getElementById("form-categoria");
const categoriaId = document.getElementById("categoria-id");
const categoriaNombre = document.getElementById("categoria-nombre");
const btnCancelarCategoria = document.getElementById("btn-cancelar-categoria");
const tablaCategorias = document.getElementById("tabla-categorias");
const cargandoCategorias = document.getElementById("cargando-categorias");

// productos
const formProducto = document.getElementById("form-producto");
const productoId = document.getElementById("producto-id");
const productoNombre = document.getElementById("producto-nombre");
const productoPrecio = document.getElementById("producto-precio");
const productoCantidad = document.getElementById("producto-cantidad");
const productoCategoria = document.getElementById("producto-categoria");
const btnCancelarProducto = document.getElementById("btn-cancelar-producto");
const tablaProductos = document.getElementById("tabla-productos");
const cargandoProductos = document.getElementById("cargando-productos");

// guardo las categorias aqui para usarlas en el select y en la tabla
let listaCategorias = [];

// variable para el temporizador del mensaje
let temporizador;


// ============================================
// FUNCION PARA MOSTRAR MENSAJES (exito o error)
// ============================================
function mostrarMensaje(texto, tipo) {
  mensaje.textContent = texto;
  mensaje.className = tipo; // "exito" o "error" (clases del css)

  // se quita solo a los 4 segundos
  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mensaje.className = "oculto";
  }, 4000);
}


// ============================================
// CATEGORIAS
// ============================================

// LEER (Read): trae todas las categorias de la base de datos
async function cargarCategorias() {
  cargandoCategorias.classList.remove("oculto");

  const { data, error } = await db
    .from("categorias")
    .select("*")
    .order("nombre");

  cargandoCategorias.classList.add("oculto");

  if (error) {
    mostrarMensaje("Error al cargar las categorías: " + error.message, "error");
    return;
  }

  listaCategorias = data;
  dibujarCategorias();
  llenarSelectCategorias();
}

// dibuja las filas de la tabla de categorias
function dibujarCategorias() {
  tablaCategorias.innerHTML = ""; // limpio la tabla

  if (listaCategorias.length === 0) {
    tablaCategorias.innerHTML = "<tr><td colspan='2'>No hay categorías todavía</td></tr>";
    return;
  }

  listaCategorias.forEach(function (cat) {
    const fila = document.createElement("tr");

    const celdaNombre = document.createElement("td");
    celdaNombre.textContent = cat.nombre;

    const celdaAcciones = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", function () {
      editarCategoria(cat);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function () {
      eliminarCategoria(cat);
    });

    celdaAcciones.appendChild(btnEditar);
    celdaAcciones.appendChild(btnEliminar);

    fila.appendChild(celdaNombre);
    fila.appendChild(celdaAcciones);
    tablaCategorias.appendChild(fila);
  });
}

// llena el select del formulario de productos con las categorias
function llenarSelectCategorias() {
  const seleccionada = productoCategoria.value; // para no perder lo que estaba elegido

  productoCategoria.innerHTML = "<option value=''>-- Selecciona una categoría --</option>";

  listaCategorias.forEach(function (cat) {
    const opcion = document.createElement("option");
    opcion.value = cat.id;
    opcion.textContent = cat.nombre;
    productoCategoria.appendChild(opcion);
  });

  productoCategoria.value = seleccionada;
}

// CREAR (Create) y ACTUALIZAR (Update): se ejecuta al darle Guardar
formCategoria.addEventListener("submit", async function (e) {
  e.preventDefault(); // evita que la pagina se recargue

  const nombre = categoriaNombre.value.trim();

  // validaciones
  if (nombre === "") {
    mostrarMensaje("El nombre de la categoría es obligatorio", "error");
    return;
  }
  if (nombre.length < 3) {
    mostrarMensaje("El nombre debe tener al menos 3 caracteres", "error");
    return;
  }

  let error;

  if (categoriaId.value === "") {
    // no hay id -> es una categoria nueva (INSERT)
    const respuesta = await db.from("categorias").insert({ nombre: nombre });
    error = respuesta.error;
  } else {
    // hay id -> estoy editando (UPDATE)
    const respuesta = await db
      .from("categorias")
      .update({ nombre: nombre })
      .eq("id", categoriaId.value);
    error = respuesta.error;
  }

  if (error) {
    // el codigo 23505 es cuando el nombre ya existe (unique)
    if (error.code === "23505") {
      mostrarMensaje("Esa categoría ya existe", "error");
    } else {
      mostrarMensaje("Error al guardar: " + error.message, "error");
    }
    return;
  }

  const fueEdicion = categoriaId.value !== "";
  mostrarMensaje(fueEdicion ? "Categoría actualizada" : "Categoría agregada", "exito");
  limpiarFormCategoria();
  cargarCategorias();
  cargarProductos(); // por si cambio el nombre y se usa en la tabla de productos
});

// pasa los datos de la categoria al formulario para editarla
function editarCategoria(cat) {
  categoriaId.value = cat.id;
  categoriaNombre.value = cat.nombre;
  btnCancelarCategoria.classList.remove("oculto");
  categoriaNombre.focus();
}

// BORRAR (Delete)
async function eliminarCategoria(cat) {
  const seguro = confirm("¿Seguro que quieres eliminar la categoría '" + cat.nombre + "'?");
  if (!seguro) return;

  const { error } = await db.from("categorias").delete().eq("id", cat.id);

  if (error) {
    // 23503 = violacion de llave foranea (todavia tiene productos)
    if (error.code === "23503") {
      mostrarMensaje("No se puede eliminar: la categoría todavía tiene productos", "error");
    } else {
      mostrarMensaje("Error al eliminar: " + error.message, "error");
    }
    return;
  }

  mostrarMensaje("Categoría eliminada", "exito");
  cargarCategorias();
}

function limpiarFormCategoria() {
  formCategoria.reset();
  categoriaId.value = "";
  btnCancelarCategoria.classList.add("oculto");
}

btnCancelarCategoria.addEventListener("click", limpiarFormCategoria);


// ============================================
// PRODUCTOS
// ============================================

// LEER: trae los productos junto con el nombre de su categoria
async function cargarProductos() {
  cargandoProductos.classList.remove("oculto");

  // "categorias(nombre)" hace el join gracias a la llave foranea
  const { data, error } = await db
    .from("productos")
    .select("id, nombre, precio, cantidad, categoria_id, categorias(nombre)")
    .order("nombre");

  cargandoProductos.classList.add("oculto");

  if (error) {
    mostrarMensaje("Error al cargar los productos: " + error.message, "error");
    return;
  }

  dibujarProductos(data);
}

function dibujarProductos(productos) {
  tablaProductos.innerHTML = "";

  if (productos.length === 0) {
    tablaProductos.innerHTML = "<tr><td colspan='5'>No hay productos todavía</td></tr>";
    return;
  }

  productos.forEach(function (prod) {
    const fila = document.createElement("tr");

    // creo las celdas de texto
    const datos = [
      prod.nombre,
      "$" + Number(prod.precio).toFixed(2),
      prod.cantidad,
      prod.categorias ? prod.categorias.nombre : "Sin categoría"
    ];

    datos.forEach(function (dato) {
      const celda = document.createElement("td");
      celda.textContent = dato;
      fila.appendChild(celda);
    });

    // celda de botones
    const celdaAcciones = document.createElement("td");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", function () {
      editarProducto(prod);
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", function () {
      eliminarProducto(prod);
    });

    celdaAcciones.appendChild(btnEditar);
    celdaAcciones.appendChild(btnEliminar);
    fila.appendChild(celdaAcciones);

    tablaProductos.appendChild(fila);
  });
}

// CREAR y ACTUALIZAR producto
formProducto.addEventListener("submit", async function (e) {
  e.preventDefault();

  const nombre = productoNombre.value.trim();
  const precio = productoPrecio.value;
  const cantidad = productoCantidad.value;
  const categoria = productoCategoria.value;

  // validaciones
  if (nombre === "") {
    mostrarMensaje("El nombre del producto es obligatorio", "error");
    return;
  }
  if (precio === "" || Number(precio) < 0) {
    mostrarMensaje("El precio debe ser un número mayor o igual a 0", "error");
    return;
  }
  if (cantidad === "" || Number(cantidad) < 0 || !Number.isInteger(Number(cantidad))) {
    mostrarMensaje("La cantidad debe ser un número entero mayor o igual a 0", "error");
    return;
  }
  if (categoria === "") {
    mostrarMensaje("Tienes que seleccionar una categoría", "error");
    return;
  }

  // objeto con los datos que se van a guardar
  const producto = {
    nombre: nombre,
    precio: Number(precio),
    cantidad: Number(cantidad),
    categoria_id: Number(categoria)
  };

  let error;

  if (productoId.value === "") {
    const respuesta = await db.from("productos").insert(producto);
    error = respuesta.error;
  } else {
    const respuesta = await db
      .from("productos")
      .update(producto)
      .eq("id", productoId.value);
    error = respuesta.error;
  }

  if (error) {
    mostrarMensaje("Error al guardar el producto: " + error.message, "error");
    return;
  }

  const fueEdicion = productoId.value !== "";
  mostrarMensaje(fueEdicion ? "Producto actualizado" : "Producto agregado", "exito");
  limpiarFormProducto();
  cargarProductos();
});

// pasa los datos del producto al formulario para editarlo
function editarProducto(prod) {
  productoId.value = prod.id;
  productoNombre.value = prod.nombre;
  productoPrecio.value = prod.precio;
  productoCantidad.value = prod.cantidad;
  productoCategoria.value = prod.categoria_id;
  btnCancelarProducto.classList.remove("oculto");
  productoNombre.focus();
}

// BORRAR producto
async function eliminarProducto(prod) {
  const seguro = confirm("¿Seguro que quieres eliminar '" + prod.nombre + "'?");
  if (!seguro) return;

  const { error } = await db.from("productos").delete().eq("id", prod.id);

  if (error) {
    mostrarMensaje("Error al eliminar: " + error.message, "error");
    return;
  }

  mostrarMensaje("Producto eliminado", "exito");
  cargarProductos();
}

function limpiarFormProducto() {
  formProducto.reset();
  productoId.value = "";
  btnCancelarProducto.classList.add("oculto");
}

btnCancelarProducto.addEventListener("click", limpiarFormProducto);


// ============================================
// AL ABRIR LA PAGINA
// ============================================
// primero las categorias (para el select) y luego los productos
async function iniciar() {
  await cargarCategorias();
  await cargarProductos();
}

iniciar();
