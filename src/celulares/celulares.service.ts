import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateCelularDto } from './dto/create-celular.dto';
import { UpdateCelularDto } from './dto/update-celular.dto';
import { QueryCelularDto } from './dto/query-celular.dto';
import { Celular } from './entities/celular.entity';

@Injectable()
export class CelularesService {
  constructor(
    @InjectRepository(Celular)
    private readonly celularRepository: Repository<Celular>,
  ) {}

  async create(createCelularDto: CreateCelularDto): Promise<Celular> {
    return this.celularRepository.save(createCelularDto);
  }

  async findAll(query: QueryCelularDto): Promise<Celular[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = (query.sortBy ?? 'nombre') as keyof Celular;
    const orderBy = query.orderBy ?? 'asc';

    return this.celularRepository.find({
      where: query.nombre ? { nombre: ILike(`%${query.nombre}%`) } : {},
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
