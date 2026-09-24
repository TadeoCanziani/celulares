import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const marcaExiste = this.marcas.some(
      (marca) =>
        marca.nombre.toLowerCase() === createMarcaDto.nombre.toLowerCase(),
    );

    if (marcaExiste) {
      throw new ConflictException('La marca ya existe');
    }

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

  findOne(id: number): Marca {
    const marca = this.marcas.find((marca) => marca.id === id);
    if (!marca) {
      throw new NotFoundException(`La marca con id ${id} no existe`);
    }
    return marca;
  }

  update(id: number, updateMarcaDto: UpdateMarcaDto): Marca {
    const marca = this.findOne(id);

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

  remove(id: number): string {
    const index = this.marcas.findIndex((m) => m.id === id);
    if (index === -1) {
      throw new NotFoundException('La marca no existe');
    }

    const marcaEliminada = this.marcas.splice(index, 1)[0];
    return `La marca ${marcaEliminada.nombre} con id ${marcaEliminada.id} fue eliminada exitosamente`;
  }
}
