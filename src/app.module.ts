import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Celular } from './celulares/entities/celular.entity';
import { CelularesModule } from './celulares/celulares.module';
import { Marca } from './marcas/entities/marca.entity';
import { MarcasModule } from './marcas/marcas.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Marca, Celular],
      synchronize: true,
    }),
    MarcasModule,
    CelularesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
