import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCelularDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;
  @IsString()
  tamano!: string;
  @IsString()
  memoriaRam!: string;
  @IsString()
  espacioAlmacenamiento!: string;
  @IsNumber()
  nucleos!: number;
  @IsNumber()
  marcaId!: number;
}
