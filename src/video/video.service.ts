
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoService {
  getVideoStream(range: string) {
    const videoPath = path.join(process.cwd(), 'src/assets/sample.mp4');
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

    const contentLength = end - start + 1;

    return {
      videoPath,
      start,
      end,
      contentLength,
      fileSize,
    };
  }
}
