# Resumen Completo del TP — Tecnologías Web

**Backend NestJS + TypeORM + PostgreSQL**
Proyecto: Celulares (Marcas 1‑N Celulares)

---

## 1. Creación del proyecto

Se creó el proyecto NestJS con el CLI:

```
nest new celulares
```

Se eligió npm como gestor de paquetes. El proyecto quedó en `C:\Users\Dell\celulares` y se conectó al repositorio de GitHub `TadeoCanziani/celulares`.

**Recursos generados:**

```
nest g resource marcas
nest g resource celulares
```

Nest generó los archivos iniciales: controllers, services, DTOs, entities y módulos para cada entidad.

---

## 2. Modelo de datos

Se definió una relación **1 a N** entre Marca y Celular:

```
Marca (1)  ←────  (N) Celular
```

### Entidad Marca

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | PK autoincremental |
| `nombre` | string | Nombre de la marca |

### Entidad Celular

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | number | PK autoincremental |
| `nombre` | string | Nombre del modelo |
| `tamano` | string | Tamaño de pantalla |
| `memoriaRam` | string | RAM (ej: "8GB") |
| `espacioAlmacenamiento` | string | Almacenamiento (ej: "256GB") |
| `nucleos` | number | Cantidad de núcleos |
| `marcaId` | number | FK hacia marcas.id |

---

## 3. CRUD en memoria (primera etapa)

Antes de conectar con la base de datos, se implementó el CRUD completo usando arrays en memoria:

- **Marcas:** array con seed (Samsung, Apple, Xiaomi) + contador `nextId`
- **Celulares:** array con seed (Galaxy S24, iPhone 15, Redmi Note 12) + contador `nextId`

Esto permitió probar todos los endpoints con Thunder Client antes de complicar con la base de datos.

---

## 4. Endpoints implementados

### Marcas

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/marcas` | Listar todas (filtro por `?nombre=`) |
| `GET` | `/marcas/:id` | Obtener una por id |
| `POST` | `/marcas` | Crear una marca |
| `PATCH` | `/marcas/:id` | Actualizar una marca |
| `DELETE` | `/marcas/:id` | Eliminar una marca |

### Celulares

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/celulares` | Listar todos (filtros, orden, paginación) |
| `GET` | `/celulares/:id` | Obtener uno por id |
| `POST` | `/celulares` | Crear un celular |
| `PATCH` | `/celulares/:id` | Actualizar un celular |
| `DELETE` | `/celulares/:id` | Eliminar un celular |

### Query params de `/celulares`

| Param | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Filtro parcial case-insensitive |
| `memoriaRam` | string | Filtro exacto |
| `marcaId` | number | Filtro exacto |
| `sortBy` | string | Campo de orden (default: `nombre`) |
| `orderBy` | `asc` \| `desc` | Dirección del orden (default: `asc`) |
| `page` | number | Página (default: 1) |
| `limit` | number | Elementos por página (default: 10) |

**Ejemplo de consulta combinada:**

```
GET /celulares?memoriaRam=8GB&sortBy=nombre&orderBy=asc&page=1&limit=10
```

---

## 5. Validaciones

### 5.1 Parámetros de URL (`:id`)

Todos los endpoints con `:id` usan `ParseIntPipe` de NestJS. Si el id no es numérico → **400 Bad Request**.

### 5.2 Body (DTOs) con `class-validator`

Se activó el `ValidationPipe` global en `main.ts`:

```ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

**CreateMarcaDto:** `nombre` con `@IsString()` + `@IsNotEmpty()`

**CreateCelularDto:** `nombre` con `@IsString()` + `@IsNotEmpty()`, campos string con `@IsString()`, `nucleos` y `marcaId` con `@IsNumber()`

**QueryCelularDto:** todos `@IsOptional()`, `orderBy` con `@IsIn(['asc','desc'])`, campos numéricos con `@Type(() => Number)` + `@IsNumber()`

### 5.3 Validaciones de negocio (services)

**MarcasService:**

| Método | Validación | Error |
|---|---|---|
| `create` | Nombre duplicado (case-insensitive con `ILike`) | **409** — "La marca ya existe" |
| `findOne` | Marca no existe | **404** — "La marca con id X no existe" |
| `remove` | Tiene celulares asociados | **409** — "No se puede eliminar la marca porque tiene celulares asociados" |

**CelularesService:**

| Método | Validación | Error |
|---|---|---|
| `create` | Marca no existe | **404** — "La marca con id X no existe" |
| `create` | Nombre duplicado (case-insensitive con `ILike`) | **409** — "El celular ya existe" |
| `findOne` | Celular no existe | **404** — "El celular con id X no existe" |
| `update` | Nombre duplicado en otro celular | **409** — "Ya existe un celular con ese nombre" |

---

## 6. Migración a TypeORM + PostgreSQL

### 6.1 Docker

Se creó un `docker-compose.yml` con PostgreSQL:

```yaml
services:
  postgres:
    image: 'postgres:latest'
    restart: always
    volumes:
      - './postgres_data:/var/lib/postgresql/data'
    environment:
      - POSTGRES_USER=tadeo
      - POSTGRES_DB=celulares
      - POSTGRES_PASSWORD=minoria
    ports:
      - '5432:5432'
```

Para levantarlo: `docker compose up -d`

### 6.2 Variables de entorno

Se instaló `@nestjs/config` y se crearon los archivos `.env` (con credenciales reales, en `.gitignore`) y `.env.example` (para el repo):

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tadeo
DB_PASSWORD=minoria
DB_NAME=celulares
```

### 6.3 Configuración en AppModule

```ts
ConfigModule.forRoot(),
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Marca, Celular],
  synchronize: true,
}),
```

### 6.4 Entities con decoradores TypeORM

```ts
@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @OneToMany(() => Celular, (celular) => celular.marca)
  celulares?: Celular[];
}
```

```ts
@Entity('celulares')
export class Celular {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  // ... demás campos con @Column()

  @Column()
  marcaId!: number;

  @ManyToOne(() => Marca, (marca) => marca.celulares)
  @JoinColumn({ name: 'marcaId' })
  marca?: Marca;
}
```

### 6.5 Módulos con `forFeature`

```ts
// marcas.module.ts
imports: [TypeOrmModule.forFeature([Marca, Celular])]

// celulares.module.ts
imports: [TypeOrmModule.forFeature([Celular, Marca])]
```

### 6.6 Services con Repository Pattern

Se reemplazaron los arrays en memoria por repositories de TypeORM:

```ts
constructor(
  @InjectRepository(Celular)
  private readonly celularRepository: Repository<Celular>,
  @InjectRepository(Marca)
  private readonly marcaRepository: Repository<Marca>,
) {}
```

**Operaciones principales:**

| Operación | Método del repository |
|---|---|
| Traer todos | `find({ where, order, skip, take })` |
| Traer por id | `findOneBy({ id })` |
| Crear | `save(dto)` |
| Actualizar | `merge()` + `save()` |
| Borrar | `remove(entity)` o `delete(id)` |

---

## 7. Persistencia

Con TypeORM conectado a PostgreSQL, los datos **persisten entre reinicios** de la aplicación. Esto es la diferencia principal con el array en memoria (que se borraba con cada `npm run start:dev`).

**Prueba de persistencia:**
1. Crear datos con `POST`
2. Detener la app con `Ctrl+C`
3. Levantar de nuevo con `npm run start:dev`
4. Los datos siguen ahí

---

## 8. Herramientas de prueba

- **Thunder Client** (extensión de VS Code) para probar endpoints
- **Docker Desktop** para levantar PostgreSQL
- **Postman** para la colección de endpoints (requerida por la consigna)

---

## 9. Comandos utiles

| Comando | Descripción |
|---|---|
| `docker compose up -d` | Levantar PostgreSQL |
| `docker compose down` | Detener PostgreSQL |
| `npm run start:dev` | Levantar la app NestJS con watch |
| `npm run build` | Compilar el proyecto |
| `git add .` | Etodos los cambios |
| `git commit -m "msg"` | Commitear |
| `git push` | Subir a GitHub |

---

## 10. Orden de arranque

1. Abrir **Docker Desktop** y esperar "Engine running"
2. `docker compose up -d` → PostgreSQL listo
3. `npm run start:dev` → API escuchando en `http://localhost:3000`
4. Probar endpoints con Thunder Client o Postman
