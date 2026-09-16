import { Injectable } from '@nestjs/common';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { Celular } from './entities/celular.entity';

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

  findAll(nombre?: string): Celular[] {
    if (!nombre) return this.celulares;

    const texto = nombre.toLowerCase();
    return this.celulares.filter((celular) =>
      celular.nombre.toLowerCase().includes(texto),
    );
  }

  findOne(id: number): Celular | undefined {
    return this.celulares.find((celular) => celular.id === id);
  }

  update(id: number, updateCelularDto: UpdateCelularDto): Celular | undefined {
    const celular = this.findOne(id);
    if (!celular) return undefined;

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

  remove(id: number): Celular | null {
    const index = this.celulares.findIndex((c) => c.id === id);
    if (index === -1) return null;

    return this.celulares.splice(index, 1)[0];
  }
}
