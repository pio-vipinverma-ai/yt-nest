import {
  Controller,
  Get,
  Headers,
  Param,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import * as fs from 'fs';
import { VideoService } from './video.service';
import type { Request, Response } from 'express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Get('stream')
  streamVideo(@Headers('range') range: string, @Res() res: Response) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const videoPath = 'src/assets/sample.mp4';

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (!range) {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });

      fs.createReadStream(videoPath).pipe(res);
      return;
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4',
    });

    fs.createReadStream(videoPath, { start, end }).pipe(res);
  }

  @Get('hls')
  getMasterPlaylist(@Res() res: Response, @Req() req?: Request) {
    const accept = req?.headers.accept || '';

    if (accept.includes('text/html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(this.videoService.getHtmlPlayer());
      return;
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(this.videoService.getMasterPlaylist());
  }

  @Get('hls/:playlistName')
  getPlaylistVariant(@Param('playlistName') playlistName: string, @Res() res: Response) {
    if (playlistName.endsWith('.m3u8')) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.send(this.videoService.getPlaylist(playlistName));
      return;
    }

    // Stream .ts segment with proper MIME type
    res.setHeader('Content-Type', 'video/MP2T');
    const streamable = this.videoService.getSegment(playlistName);
    // StreamableFile contains a stream; send it via Express response
    // @ts-ignore
    streamable.getStream().pipe(res);
  }

  @Get('hls/:playlistName/:segment')
  getSegment(@Param('segment') segment: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'video/MP2T');
    const streamable = this.videoService.getSegment(segment);
    // @ts-ignore
    streamable.getStream().pipe(res);
  }
}