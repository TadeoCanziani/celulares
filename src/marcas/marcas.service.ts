import { Injectable } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcasService {
  private readonly marcas: Marca[] = [
    { id: 1, nombre: 'Samsung' },
    { id: 2, nombre: 'Apple' },
    { id: 3, nombre: 'Xiaomi' },
  ];

  private nextId = 4;

  create(createMarcaDto: CreateMarcaDto): Marca {
    const marca: Marca = {
      id: this.nextId++,
      nombre: createMarcaDto.nombre,
    };

    this.marcas.push(marca);
    return marca;
  }

  findAll(nombre?: string): Marca[] {
    if (!nombre) return this.marcas;

    const texto = nombre.toLowerCase();
    return this.marcas.filter((marca) =>
      marca.nombre.toLowerCase().includes(texto),
    );
  }

  findOne(id: number): Marca | undefined {
    return this.marcas.find((marca) => marca.id === id);
  }

  update(id: number, updateMarcaDto: UpdateMarcaDto): Marca | undefined {
    const marca = this.findOne(id);
    if (!marca) return undefined;

    const marcaActualizada: Marca = {
      ...marca,
      ...updateMarcaDto,
    };

    const index = this.marcas.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.marcas[index] = marcaActualizada;
    }

    return marcaActualizada;
  }

  remove(id: number): Marca | null {
    const index = this.marcas.findIndex((m) => m.id === id);
    if (index === -1) return null;

    return this.marcas.splice(index, 1)[0];
  }
}
