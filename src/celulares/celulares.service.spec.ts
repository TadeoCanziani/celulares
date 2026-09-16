import { Test, TestingModule } from '@nestjs/testing';
import { CelularesService } from './celulares.service';

describe('CelularesService', () => {
  let service: CelularesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CelularesService],
    }).compile();

    service = module.get<CelularesService>(CelularesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a celular from dto without using new instances', () => {
    const result = service.create({
      nombre: 'P30',
      tamano: '6.1',
      memoriaRam: '6GB',
      espacioAlmacenamiento: '128GB',
      nucleos: 8,
      anio: 2020,
      marcaId: 2,
    });

    expect(result).toMatchObject({
      id: 4,
      nombre: 'P30',
      marcaId: 2,
    });
    expect(service.findOne(4)).toMatchObject({
      nombre: 'P30',
      marcaId: 2,
    });
  });
});
