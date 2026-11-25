import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { QueryCelularDto } from './dto/query-celular.dto';
import { Celular } from './entities/celular.entity';
import { Marca } from 'src/marcas/entities/marca.entity';

@Injectable()
export class CelularesService {
  constructor(
    @InjectRepository(Celular)
    private readonly celularRepository: Repository<Celular>,
    @InjectRepository(Marca)
    private readonly marcaRepository: Repository<Marca>,
  ) {}

  async create(dto: CreateCelularDto): Promise<Celular> {
    // ¿Existe la marca con el id que me mandaron?
    const marca = await this.marcaRepository.findOneBy({ id: dto.marcaId });

    if (!marca) {
      throw new NotFoundException(`La marca con id ${dto.marcaId} no existe`);
    }

    // ¿Ya existe un celular con ese nombre? (case-insensitive)
    const celularExiste = await this.celularRepository.findOne({
      where: { nombre: ILike(dto.nombre) },
    });

    if (celularExiste) {
      throw new ConflictException('El celular ya existe');
    }

    return this.celularRepository.save(dto);
  }

  async findAll(query: QueryCelularDto): Promise<Celular[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = (query.sortBy ?? 'nombre') as keyof Celular;
    const orderBy = query.orderBy ?? 'asc';

    const where: any = {};

    if (query.nombre) {
      where.nombre = ILike(`%${query.nombre}%`);
    }
    if (query.memoriaRam) {
      where.memoriaRam = query.memoriaRam;
    }
    if (query.marcaId) {
      where.marcaId = query.marcaId;
    }

    return this.celularRepository.find({
      where,
      order: { [sortBy]: orderBy === 'asc' ? 'ASC' : 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: number): Promise<Celular> {
    const celular = await this.celularRepository.findOne({ where: { id } });

    if (!celular) {
      throw new NotFoundException(`El celular con id ${id} no existe`);
    }

    return celular;
  }

  async update(
    id: number,
    updateCelularDto: UpdateCelularDto,
  ): Promise<Celular> {
    const celular = await this.findOne(id);

    // Si viene un nombre, verificar que no exista en OTRO celular
    if (updateCelularDto.nombre) {
      const nombreExiste = await this.celularRepository.findOneBy({
        nombre: ILike(updateCelularDto.nombre),
      });

      if (nombreExiste && nombreExiste.id !== id) {
        throw new ConflictException('Ya existe un celular con ese nombre');
      }
    }

    const celularActualizado = this.celularRepository.merge(
      celular,
      updateCelularDto,
    );
    return this.celularRepository.save(celularActualizado);
  }

  async remove(id: number): Promise<Celular> {
    const celular = await this.findOne(id);
    await this.celularRepository.remove(celular);
    return celular;
  }
}
