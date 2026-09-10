import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarcasModule } from './marcas/marcas.module';
import { CelularesModule } from './celulares/celulares.module';

@Module({
  imports: [MarcasModule, CelularesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
