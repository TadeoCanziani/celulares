import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelularesService } from './celulares.service';
import { CelularesController } from './celulares.controller';
import { Celular } from './entities/celular.entity';
import { Marca } from '../marcas/entities/marca.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Celular, Marca])],
  controllers: [CelularesController],
  providers: [CelularesService],
})
export class CelularesModule {}
