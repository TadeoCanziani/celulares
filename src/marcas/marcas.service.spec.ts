import { Test, TestingModule } from '@nestjs/testing';
import { MarcasService } from './marcas.service';

describe('MarcasService', () => {
  let service: MarcasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarcasService],
    }).compile();

    service = module.get<MarcasService>(MarcasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a marca from dto', () => {
    const result = service.create({ nombre: 'Motorola' });

    expect(result).toMatchObject({
      nombre: 'Motorola',
    });
    expect(result.id).toBeDefined();
  });

  it('should reject a marca that already exists', () => {
    expect(() => service.create({ nombre: 'apple' })).toThrow(
      'La marca ya existe',
    );
  });

  it('should reject removing a marca that does not exist', () => {
    expect(() => service.remove(999)).toThrow('La marca no existe');
  });

  it('should return a success message when removing a marca', () => {
    expect(service.remove(1)).toBe(
      'La marca Samsung con id 1 fue eliminada exitosamente',
    );
  });
});
