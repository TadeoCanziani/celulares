import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Celular } from '../../celulares/entities/celular.entity';

@Entity('marcas')
export class Marca {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @OneToMany(() => Celular, (celular) => celular.marca)
  celulares?: Celular[];
}

