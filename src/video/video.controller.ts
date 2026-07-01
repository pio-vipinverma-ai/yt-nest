import {
  Controller,
  Get,
  Headers,
  Res,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
import * as fs from 'fs';
import { VideoService } from './video.service';
import type { Response } from 'express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('stream')
    streamVideo(@Headers('range') range: string, @Res() res: Response) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      const videoPath = "src/assets/sample.mp4";
      const fs = require("fs");

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;

      if (!range) {
        // ✅ fallback (important)
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/mp4",
        });

        fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

  const chunkSize = end - start + 1;

  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize,
    "Content-Type": "video/mp4",
  });

  fs.createReadStream(videoPath, { start, end }).pipe(res);
  }
}