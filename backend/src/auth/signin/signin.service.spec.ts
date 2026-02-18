import { Test, TestingModule } from '@nestjs/testing';
import { SigninService } from './signin.service';
import { UtilsService } from '../../shared/services/utils.func.service';
import { playerTable } from '../../shared/db/schema';

describe('SigninService', () => {
  let service: SigninService;
  let utilsService: Pick<UtilsService, 'insertPlayers'>;

  beforeEach(async () => {
    utilsService = {
      insertPlayers: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SigninService,
        {
          provide: UtilsService,
          useValue: utilsService,
        },
      ],
    }).compile();

    service = module.get<SigninService>(SigninService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registerPlayers calls insertPlayers with expected payload', () => {
    const mailAddress = 'user@example.com';
    const gameName = 'player1';
    const pwd = 'secret';

    service.registerPlayers(mailAddress, gameName, pwd);

    expect(utilsService.insertPlayers).toHaveBeenCalledWith(
      [
        {
          gameName,
          mailAddress,
          pwd,
        },
      ],
      {
        id: playerTable.playerId,
        gameName: playerTable.gameName,
      }
    );
  });

  it('registerPlayers returns insertPlayers result', async () => {
    const mailAddress = 'user@example.com';
    const gameName = 'player2';
    const pwd = 'secret';
    const insertResult = [{ playerId: 1, gameName }];

    (utilsService.insertPlayers as jest.Mock).mockResolvedValue(insertResult);

    await expect(
      service.registerPlayers(mailAddress, gameName, pwd)
    ).resolves.toBe(insertResult);
  });
});
