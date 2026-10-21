import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { Marca } from './entities/marca.entity';
import { Celular } from '../celulares/entities/celular.entity';

@Injectable()
export class MarcasService {
  constructor(
    @InjectRepository(Marca)
    private readonly marcasRepository: Repository<Marca>,
    @InjectRepository(Celular)
    private readonly celularRepository: Repository<Celular>,
  ) {}

  async create(createMarcaDto: CreateMarcaDto): Promise<Marca> {
    const marcaExiste = await this.marcasRepository.findOneBy({
      nombre: ILike(createMarcaDto.nombre),
    });

    if (marcaExiste) {
      throw new ConflictException('La marca ya existe');
    }

    return this.marcasRepository.save(createMarcaDto);
  }

  async findAll(nombre?: string): Promise<Marca[]> {
    if (!nombre) {
      return this.marcasRepository.find();
    }

    return this.marcasRepository.find({
      where: { nombre: ILike(`%${nombre}%`) },
    });
  }

  async findOne(id: number): Promise<Marca> {
    const marca = await this.marcasRepository.findOneBy({ id });

    if (!marca) {
      throw new NotFoundException(`La marca con id ${id} no existe`);
    }

    return marca;
  }

  async update(id: number, updateMarcaDto: UpdateMarcaDto): Promise<Marca> {
    await this.findOne(id);
    await this.marcasRepository.update(id, updateMarcaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // 1. ¿La marca existe?
    await this.findOne(id);

    // 2. ¿Tiene celulares asociados?
    const celulares = await this.celularRepository.find({
      where: { marcaId: id },
    });

    if (celulares.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la marca porque tiene celulares asociados',
      );
    }

    // 3. Recién ahí borro
    await this.marcasRepository.delete(id);
  }
}
