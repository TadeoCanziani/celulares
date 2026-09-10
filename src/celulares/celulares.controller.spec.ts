import { Test, TestingModule } from '@nestjs/testing';
import { CelularesController } from './celulares.controller';
import { CelularesService } from './celulares.service';

describe('CelularesController', () => {
  let controller: CelularesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CelularesController],
      providers: [CelularesService],
    }).compile();

    controller = module.get<CelularesController>(CelularesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
