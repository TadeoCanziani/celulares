import { Injectable } from '@nestjs/common';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { Celular } from './entities/celular.entity';

@Injectable()
export class CelularesService {
  private readonly celulares: Celular[] = [];
  create(createCelularDto: CreateCelularDto) {
    const nuevoCelular = new Celular();
    nuevoCelular.id = Date.now();
    nuevoCelular.nombre = createCelularDto.nombre;
    nuevoCelular.tamano = createCelularDto.tamano;
    nuevoCelular.memoriaRam = createCelularDto.memoriaRam;
    nuevoCelular.espacioAlmacenamiento = createCelularDto.espacioAlmacenamiento;
    nuevoCelular.nucleos = createCelularDto.nucleos;
    nuevoCelular.anio = createCelularDto.anio;
    this.celulares.push(nuevoCelular);
    return nuevoCelular;
  }

  findAll(nombre?: string) {
    if (!nombre) return this.celulares;
    return this.celulares.filter((celular) =>
      celular.nombre?.toLowerCase().includes(nombre.toLowerCase()),
    );
  }

  findOne(id: number) {
    return this.celulares.find((celular) => celular.id === id);
  }

  update(id: number, updateCelularDto: UpdateCelularDto) {
    const celular = this.findOne(id);
    if (!celular) return celular;

    if (updateCelularDto.nombre !== undefined)
      celular.nombre = updateCelularDto.nombre;
    if (updateCelularDto.tamano !== undefined)
      celular.tamano = updateCelularDto.tamano;
    if (updateCelularDto.memoriaRam !== undefined)
      celular.memoriaRam = updateCelularDto.memoriaRam;
    if (updateCelularDto.espacioAlmacenamiento !== undefined)
      celular.espacioAlmacenamiento = updateCelularDto.espacioAlmacenamiento;
    if (updateCelularDto.nucleos !== undefined)
      celular.nucleos = updateCelularDto.nucleos;
    if (updateCelularDto.anio !== undefined)
      celular.anio = updateCelularDto.anio;

    return celular;
  }

  remove(id: number) {
    const index = this.celulares.findIndex((c) => c.id === id);
    if (index > -1) {
      return this.celulares.splice(index, 1)[0];
    }
    return null;
  }
}
