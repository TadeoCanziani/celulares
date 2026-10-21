# Historial de Consultas y Trabajo Realizado — TP Tecnologías Web (NestJS + TypeORM)

*Resumen generado siguiendo la skill `tp-tecnologias-web` (cátedra TUARI-UNICEN). El asistente guío paso a paso sin resolver por el alumno, con checkpoints de comprensión y material de referencia.*

---

## 1. Contexto y estado inicial
- **Proyecto:** Backend NestJS "celulares" (entidades Marca 1‑N Celular).
- **Hito principal:** Migración de CRUD en memoria a persistencia con TypeORM + PostgreSQL.
- **Habilidades clave:** Validaciones `class-validator`, filtrado/orden/paginación, manejo de errores HTTP, variables de entorno, relación 1‑N.

## 2. Decisiones y avances por entidad

### Entidad **Marca**
- Fields: `id`, `nombre`.
- CRUD completo con TypeORM + PostgreSQL (Repository pattern).
- Decisión del alumno: **no requerir ordenamiento ni paginación** (porque "marcas son pocas").
- Validaciones: `@IsString() @IsNotEmpty() nombre` en `CreateMarcaDto`.
- Errores HTTP: `ConflictException` (nombre duplicado case-insensitive con `ILike`), `NotFoundException` en `findOne`/`update`, `ConflictException` en `remove` si tiene celulares asociados.

### Entidad **Celular**
- Fields: `id`, `nombre`, `tamano`, `memoriaRam`, `espacioAlmacenamiento`, `nucleos`, `marcaId` (FK).
- Filtrado por `nombre`, `memoriaRam` y `marcaId` (query params) en `findAll`.
- **Ordenamiento y paginación** vía `QueryCelularDto` (`sortBy`, `orderBy` `@IsIn(['asc','desc'])`, `page`, `limit`).
- Validaciones: `@IsNotEmpty()` en `nombre`; `@IsNumber()` en `nucleos`/`marcaId`; `@Type(() => Number)` en query params numéricos.
- Errores HTTP: `ParseIntPipe` en `:id`, `NotFoundException` en `findOne`/`update`/`remove`, `ConflictException` en `create` (nombre duplicado) y `update` (nombre duplicado en otro celular), `NotFoundException` en `create` si `marcaId` no existe.

## 3. Checkpoints pedagógicos (según skill)

| Checkpoint | Estado | Qué se pidió al alumno |
|------------|--------|----------------------|
| **Elección de nombre de entidad** | Definido: `Celular` (no `Modelo`) | Confirmado por el alumno. |
| **Filtrado vs ordenamiento/paginación** | Celulares: los tres; Marcas: solo filtro por `nombre` | El alumno decidió “marcas son pocas, no necesito ordenar ni paginar”. |
| **Parámetro `orderBy`** | Debe llamarse `orderBy` (no `order`), validado con `@IsIn(['asc','desc'])` | Alineado con material de cátedra (slides/videos). |
| **Validación de `id` numérico** | `ParseIntPipe` por defecto, mensaje adaptable vía `exceptionFactory` | Se dejó el default para no complicar código; el alumno aprobó. |
| **Error 404 cuándo id no existe** | `NotFoundException` con mensaje personalizado en `findOne`/`update`/`remove` | Implementado en ambos services. |
| **Persistencia con TypeORM** | Completado (entities, `AppModule`, `.env`, `forFeature`) | Checkpoint: ¿persiste al reiniciar? (confirmado). |
| **Repository Pattern** | Services transformados a usar `@InjectRepository` | El alumno migró el `CelularesService` y el `MarcasService` (espejo). |
| **Variables de entorno** | `.env` + `ConfigModule.forRoot()` + `TypeOrmModule.forRoot` | Datos sacados de `docker-compose.yml` (user `tadeo`, db `celulares`, password `minoria`). |

## 4. Resumen de Validaciones

### 4.1 Validación de parámetros de URL (`:id`)

| Dónde | Cómo | Error |
|---|---|---|
| `marcas.controller.ts` y `celulares.controller.ts` — en todos los `@Get(':id')`, `@Patch(':id')`, `@Delete(':id')` | `ParseIntPipe` de NestJS | **400 Bad Request** — `"Validation failed (numeric string is expected)"` si el id no es numérico |

### 4.2 Validación de body (DTOs) con `class-validator`

Se activan gracias al `ValidationPipe` global en `main.ts` (`{ transform: true }`). Si el body no pasa la validación → **400 Bad Request** con lista de mensajes.

**`CreateMarcaDto`:**

| Campo | Decorador | Error si falla |
|---|---|---|
| `nombre` | `@IsString()` + `@IsNotEmpty()` | `"nombre should not be empty"` |

**`CreateCelularDto`:**

| Campo | Decorador | Error si falla |
|---|---|---|
| `nombre` | `@IsString()` + `@IsNotEmpty()` | `"nombre should not be empty"` |
| `tamano` | `@IsString()` | `"tamano must be a string"` |
| `memoriaRam` | `@IsString()` | `"memoriaRam must be a string"` |
| `espacioAlmacenamiento` | `@IsString()` | `"espacioAlmacenamiento must be a string"` |
| `nucleos` | `@IsNumber()` | `"nucleos must be a number conforming to the specified constraints"` |
| `marcaId` | `@IsNumber()` | `"marcaId must be a number conforming to the specified constraints"` |

**`QueryCelularDto`** — query params:

| Campo | Decorador | Nota |
|---|---|---|
| `nombre` | `@IsOptional()` + `@IsString()` | Filtro parcial case-insensitive |
| `memoriaRam` | `@IsOptional()` + `@IsString()` | Filtro exacto |
| `marcaId` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | `@Type` convierte string a number |
| `sortBy` | `@IsOptional()` + `@IsString()` | Campo de ordenamiento |
| `orderBy` | `@IsOptional()` + `@IsIn(['asc','desc'])` | Solo acepta esas dos cadenas |
| `page` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | Paginación |
| `limit` | `@IsOptional()` + `@Type(() => Number)` + `@IsNumber()` | Paginación |

### 4.3 Validaciones de negocio (en los services)

**`MarcasService`:**

| Método | Validación | Función | Error |
|---|---|---|---|
| `create` | ¿Existe una marca con ese nombre? (case-insensitive) | `findOneBy({ nombre: ILike(nombre) })` | **409 Conflict** — `"La marca ya existe"` |
| `findOne` | ¿Existe la marca con ese id? | `findOneBy({ id })` | **404 Not Found** — `"La marca con id X no existe"` |
| `update` | ¿Existe la marca con ese id? | `findOne(id)` | **404 Not Found** |
| `remove` | ¿Tiene celulares asociados? | `celularRepository.find({ where: { marcaId: id } })` | **409 Conflict** — `"No se puede eliminar la marca porque tiene celulares asociados"` |

**`CelularesService`:**

| Método | Validación | Función | Error |
|---|---|---|---|
| `create` | ¿Existe la marca con ese `marcaId`? | `marcaRepository.findOneBy({ id: dto.marcaId })` | **404 Not Found** — `"La marca con id X no existe"` |
| `create` | ¿Ya existe un celular con ese nombre? (case-insensitive) | `findOneBy({ nombre: ILike(nombre) })` | **409 Conflict** — `"El celular ya existe"` |
| `findOne` | ¿Existe el celular con ese id? | `findOne({ where: { id } })` | **404 Not Found** — `"El celular con id X no existe"` |
| `update` | ¿Existe el celular con ese id? | `findOne(id)` | **404 Not Found** |
| `update` | Si viene `nombre`, ¿existe en **otro** celular? | `findOneBy({ nombre: ILike(nombre) })` + comparar `id !== id` | **409 Conflict** — `"Ya existe un celular con ese nombre"` |
| `remove` | ¿Existe el celular con ese id? | `findOne(id)` | **404 Not Found** |

### 4.4 Flujo de un `POST /celulares`

```
1. ParseIntPipe        → ¿el :id es número?     → 400 si no
2. ValidationPipe      → ¿el body es válido?     → 400 si no
3. Service create:
   a. marca existe?     →                        → 404 si no
   b. nombre duplicado? →                        → 409 si sí
   c. guardar en DB     →                        → 201 con el celular
```

## 5. Material de cátedra vinculado
- Videos: “Controllers en Nest JS” (`v=vWwrd2eCsBU`), “Rest + Filtrado” (`v=qezMe7BawK0`).
- Slides: clase 06 – Persistencia y ORM (instalación `npm install @nestjs/typeorm typeorm pg`, configuración `forRoot`, entities con `@Entity`, `@PrimaryGeneratedColumn`, `@Column`, `forFeature`, Repository pattern).
- Práctica: uso de `ParseIntPipe`, `QueryDTO` con `sortBy`/`orderBy`, migración a TypeORM.

## 6. Pendientes de la primera entrega
1. **Commiteo** del progreso (Git: `git add .`, `git commit -m "feat: ..."`, `git push`).
2. **Colección Postman** subida al repositorio (aún sin commitear).
3. **Validación de que persiste al reiniciar** (ya confirmado: los registros perduran en PostgreSQL).
4. Opcional: quitar `synchronize: true` en producción y usar migraciones (pendiente de la entrega futura).

## 7. Cumplimiento de la skill
- El asistente **no resolvió todo por el alumno**: solicitó explicaciones, dio pistas, hizo checkpoint, y el alumno fue quien escribió el código (services, entities, módulos).
- Se usaron recursos de la cátedra (normativa de `orderBy`, patrón Repository, videos).
- El lenguaje fue español durante toda la sesión.
- No se asumieron decisiones de diseño sin consultar: (ej. `anio` se sacó por decisión del alumno; variables de entorno se propusieron y el alumno decidió el esquema).

---
*Resumen listo para incluir en el informe del TP. Se sugiere agregar capturas de las respuestas de los endpoints (`GET /marcas`, `POST /marcas`, etc.) y el mensaje de "persistencia confirmada" después del reinicio.*