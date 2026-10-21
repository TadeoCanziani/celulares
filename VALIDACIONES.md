# Validaciones del Backend — NestJS Celulares

---

## 1. Parámetros de URL (`:id`)

| Endpoint | Validación | Error |
|---|---|---|
| `GET /marcas/:id` | `ParseIntPipe` | **400** — `"Validation failed (numeric string is expected)"` |
| `PATCH /marcas/:id` | `ParseIntPipe` | **400** |
| `DELETE /marcas/:id` | `ParseIntPipe` | **400** |
| `GET /celulares/:id` | `ParseIntPipe` | **400** |
| `PATCH /celulares/:id` | `ParseIntPipe` | **400** |
| `DELETE /celulares/:id` | `ParseIntPipe` | **400** |

Si mandás `/marcas/abc` en vez de `/marcas/1`, Nest rechaza antes de llegar al service.

---

## 2. Body (DTOs) con `class-validator`

Se activan con el `ValidationPipe` global en `main.ts` (`{ transform: true }`).

### `CreateMarcaDto`

| Campo | Decorador | Error si falla |
|---|---|---|
| `nombre` | `@IsString()` | `"nombre must be a string"` |
| `nombre` | `@IsNotEmpty()` | `"nombre should not be empty"` |

### `CreateCelularDto`

| Campo | Decorador | Error si falla |
|---|---|---|
| `nombre` | `@IsString()` + `@IsNotEmpty()` | `"nombre should not be empty"` |
| `tamano` | `@IsString()` | `"tamano must be a string"` |
| `memoriaRam` | `@IsString()` | `"memoriaRam must be a string"` |
| `espacioAlmacenamiento` | `@IsString()` | `"espacioAlmacenamiento must be a string"` |
| `nucleos` | `@IsNumber()` | `"nucleos must be a number conforming to the specified constraints"` |
| `marcaId` | `@IsNumber()` | `"marcaId must be a number conforming to the specified constraints"` |

### `QueryCelularDto` (query params)

| Campo | Decorador | Nota |
|---|---|---|
| `nombre` | `@IsOptional()` + `@IsString()` | Filtro parcial case-insensitive |
| `memoriaRam` | `@IsOptional()` + `@IsString()` | Filtro exacto |
| `marcaId` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | Convierte string a number antes de validar |
| `sortBy` | `@IsOptional()` + `@IsString()` | Campo de ordenamiento |
| `orderBy` | `@IsOptional()` + `@IsIn(['asc','desc'])` | Solo acepta `'asc'` o `'desc'` |
| `page` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | Número de página |
| `limit` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | Cantidad por página |

---

## 3. Negocio (en los services)

### `MarcasService`

| Método | Validación | Cómo se verifica | Error |
|---|---|---|---|
| `create` | ¿Ya existe una marca con ese nombre? (case-insensitive) | `findOneBy({ nombre: ILike(nombre) })` | **409** — `"La marca ya existe"` |
| `findOne` | ¿Existe la marca con ese id? | `findOneBy({ id })` | **404** — `"La marca con id X no existe"` |
| `update` | ¿Existe la marca con ese id? | `findOne(id)` | **404** |
| `remove` | ¿Tiene celulares asociados? | `celularRepository.find({ where: { marcaId: id } })` | **409** — `"No se puede eliminar la marca porque tiene celulares asociados"` |

### `CelularesService`

| Método | Validación | Cómo se verifica | Error |
|---|---|---|---|
| `create` | ¿Existe la marca con ese `marcaId`? | `marcaRepository.findOneBy({ id: dto.marcaId })` | **404** — `"La marca con id X no existe"` |
| `create` | ¿Ya existe un celular con ese nombre? (case-insensitive) | `findOneBy({ nombre: ILike(nombre) })` | **409** — `"El celular ya existe"` |
| `findOne` | ¿Existe el celular con ese id? | `findOne({ where: { id } })` | **404** — `"El celular con id X no existe"` |
| `update` | ¿Existe el celular con ese id? | `findOne(id)` | **404** |
| `update` | Si viene `nombre`, ¿existe en **otro** celular? | `findOneBy({ nombre: ILike(nombre) })` + comparar `id !== id` | **409** — `"Ya existe un celular con ese nombre"` |
| `remove` | ¿Existe el celular con ese id? | `findOne(id)` | **404** |

---

## 4. Flujo completo de un `POST /celulares`

```
Request llega
    │
    ▼
ParseIntPipe (:id)          → 400 si el id no es número
    │
    ▼
ValidationPipe (body DTO)   → 400 si el body no es válido
    │
    ▼
Service.create()
    │
    ├─ ¿La marca existe?     → 404 si no
    │
    ├─ ¿Nombre duplicado?    → 409 si sí
    │
    └─ Guardar en DB         → 201 con el celular creado
```

---

## 5. Flujo de un `DELETE /marcas/:id`

```
Request llega
    │
    ▼
ParseIntPipe (:id)          → 400 si el id no es número
    │
    ▼
Service.remove()
    │
    ├─ ¿La marca existe?              → 404 si no
    │
    ├─ ¿Tiene celulares asociados?    → 409 si sí
    │
    └─ Borrar de la DB                → 200 OK
```

---

## 6. Errores HTTP de referencia

| Código | Excepción de NestJS | Cuándo |
|---|---|---|
| **400** | `BadRequestException` / `ParseIntPipe` / `ValidationPipe` | Parámetro o body inválido |
| **404** | `NotFoundException` | Recurso no encontrado (id inexistente, marcaId inexistente) |
| **409** | `ConflictException` | Conflicto (nombre duplicado, borrar marca con celulares) |
| **500** | — | Error interno (nunca debería aparecer si las validaciones están bien) |
