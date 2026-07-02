import { Test, TestingModule } from '@nestjs/testing';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';

describe('VideoController', () => {
  let controller: VideoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoController],
      providers: [VideoService],
    }).compile();

    controller = module.get<VideoController>(VideoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return a master HLS playlist', () => {
    const res = {
      setHeader: jest.fn(),
      send: jest.fn(),
    } as any;

    controller.getMasterPlaylist(res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/vnd.apple.mpegurl',
    );
    expect(res.send).toHaveBeenCalledWith(
      expect.stringContaining('#EXT-X-STREAM-INF'),
    );
  });
});
