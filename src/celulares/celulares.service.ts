import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { Celular } from './entities/celular.entity';
import { QueryCelularDto } from './dto/query-celular.dto';

@Injectable()
export class CelularesService {
  private readonly celulares: Celular[] = [
    {
      id: 1,
      nombre: 'Galaxy S24',
      tamano: '6.2',
      memoriaRam: '8GB',
      espacioAlmacenamiento: '256GB',
      nucleos: 8,
      anio: 2024,
      marcaId: 1,
    },
    {
      id: 2,
      nombre: 'Iphone 15',
      tamano: '6.1',
      memoriaRam: '6GB',
      espacioAlmacenamiento: '128GB',
      nucleos: 6,
      anio: 2023,
      marcaId: 2,
    },
    {
      id: 3,
      nombre: 'Redmi Note 12',
      tamano: '6.67',
      memoriaRam: '4GB',
      espacioAlmacenamiento: '128GB',
      nucleos: 8,
      anio: 2023,
      marcaId: 3,
    },
  ];

  private nextId = 4;

  create(createCelularDto: CreateCelularDto): Celular {
    const nuevoCelular: Celular = {
      id: this.nextId++,
      nombre: createCelularDto.nombre,
      tamano: createCelularDto.tamano,
      memoriaRam: createCelularDto.memoriaRam,
      espacioAlmacenamiento: createCelularDto.espacioAlmacenamiento,
      nucleos: createCelularDto.nucleos,
      anio: createCelularDto.anio,
      marcaId: createCelularDto.marcaId,
    };

    this.celulares.push(nuevoCelular);
    return nuevoCelular;
  }

  findAll(query: QueryCelularDto): Celular[] {
    // 1) Filtro por nombre (si viene), case-insensitive
    let resultado = this.celulares;

    if (query.nombre) {
      const texto = query.nombre.toLowerCase();
      resultado = resultado.filter((celular) =>
        celular.nombre.toLowerCase().includes(texto),
      );
    }

    // 2) Ordenamiento: comparador por el campo sortBy,
    //    e invertimos el signo para orden descendente
    const sortBy = (query.sortBy ?? 'nombre') as keyof Celular;
    const orderBy = query.orderBy ?? 'asc';

    resultado = [...resultado].sort((a, b) => {
      const valorA = a[sortBy];
      const valorB = b[sortBy];

      if (valorA === valorB) return 0;
      if (valorA === undefined) return 1;
      if (valorB === undefined) return -1;

      if (valorA < valorB) {
        return orderBy === 'asc' ? -1 : 1;
      }

      return orderBy === 'asc' ? 1 : -1;
    });

    // 3) Paginación: offset = (page - 1) * limit, default limit 10
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    return resultado.slice(offset, offset + limit);
  }

  findOne(id: number): Celular {
    const celular = this.celulares.find((celular) => celular.id === id);
    if (!celular) {
      throw new NotFoundException(`El celular con id ${id} no existe`);
    }
    return celular;
  }

  update(id: number, updateCelularDto: UpdateCelularDto): Celular {
    const celular = this.findOne(id);

    const celularActualizado: Celular = {
      ...celular,
      ...updateCelularDto,
    };

    const index = this.celulares.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.celulares[index] = celularActualizado;
    }

    return celularActualizado;
  }

  remove(id: number): Celular {
    const index = this.celulares.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`El celular con id ${id} no existe`);
    }

    return this.celulares.splice(index, 1)[0];
  }
}
