-- Script para crear las tablas en Supabase
-- Se pega en: Supabase > SQL Editor > New query > Run

-- Tabla de categorias
create table categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique
);

-- Tabla de productos (cada producto pertenece a UNA categoria)
create table productos (
  id bigint generated always as identity primary key,
  nombre text not null,
  precio numeric(10,2) not null check (precio >= 0),
  cantidad integer not null check (cantidad >= 0),
  -- clave foranea: relacion de uno a muchos
  -- "restrict" = no deja borrar una categoria si todavia tiene productos
  categoria_id bigint not null references categorias(id) on delete restrict
);

-- Permisos para que la pagina (con la anon key) pueda usar las tablas
-- (es un proyecto escolar, en uno real habria que usar login)
alter table categorias enable row level security;
alter table productos enable row level security;

create policy "acceso total categorias" on categorias
  for all using (true) with check (true);
create policy "acceso total productos" on productos
  for all using (true) with check (true);

-- Datos de prueba (opcional)
insert into categorias (nombre) values ('Bebidas'), ('Botanas'), ('Limpieza');

insert into productos (nombre, precio, cantidad, categoria_id) values
  ('Refresco 600ml', 18.50, 40, 1),
  ('Papas fritas', 22.00, 25, 2),
  ('Cloro 1L', 30.00, 10, 3);
