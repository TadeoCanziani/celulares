import { Module } from '@nestjs/common';
import { CelularesService } from './celulares.service';
import { CelularesController } from './celulares.controller';

@Module({
  controllers: [CelularesController],
  providers: [CelularesService],
})
export class CelularesModule {}
