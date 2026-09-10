import { Injectable } from '@nestjs/common';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcasService {
  private readonly marcas: Marca[] = [];

  create(createMarcaDto: CreateMarcaDto) {
    const marca = new Marca();
    marca.id = Date.now();
    marca.nombre = createMarcaDto.nombre;
    this.marcas.push(marca);
    return marca;
  }

  findAll(nombre?: string) {
    if (!nombre) return this.marcas;
    return this.marcas.filter((marca) =>
      marca.nombre?.toLowerCase().includes(nombre.toLowerCase()),
    );
  }

  findOne(id: number) {
    return this.marcas.find((marca) => marca.id === id);
  }

  update(id: number, updateMarcaDto: UpdateMarcaDto) {
    const marca = this.findOne(id);
    if (marca && updateMarcaDto.nombre !== undefined) {
      marca.nombre = updateMarcaDto.nombre;
    }
    return marca;
  }

  remove(id: number) {
    const index = this.marcas.findIndex((m) => m.id === id);
    if (index > -1) {
      return this.marcas.splice(index, 1)[0];
    }
    return null;
  }
}
