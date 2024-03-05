import { Test, TestingModule } from '@nestjs/testing';
import { CounselingController } from './counseling.controller';
import { CounselingService } from './counseling.service';

describe('CounselingController', () => {
  let controller: CounselingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CounselingController],
      providers: [CounselingService],
    }).compile();

    controller = module.get<CounselingController>(CounselingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
