import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Marca } from '../../marcas/entities/marca.entity';

@Entity('celulares')
export class Celular {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  tamano!: string;

  @Column()
  memoriaRam!: string;

  @Column()
  espacioAlmacenamiento!: string;

  @Column()
  nucleos!: number;

  @Column()
  marcaId!: number;

  @ManyToOne(() => Marca, (marca) => marca.celulares)
  @JoinColumn({ name: 'marcaId' })
  marca?: Marca;
}

