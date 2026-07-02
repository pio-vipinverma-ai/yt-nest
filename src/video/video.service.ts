
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoService {
  private readonly hlsRoot = path.join(process.cwd(), 'src/assets/hls');

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

  getMasterPlaylist(): string {
    return [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,NAME="360p"',
      '/video/hls/360p.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720,NAME="720p"',
      '/video/hls/720p.m3u8',
      '#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080,NAME="1080p"',
      '/video/hls/1080p.m3u8',
    ].join('\n');
  }

  getHtmlPlayer(): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HLS Player</title>
    <style>
      body { font-family: Arial, sans-serif; background: #111; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; }
      .card { width: min(90vw, 900px); background: #1f1f1f; padding: 20px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.35); }
      video { width: 100%; border-radius: 8px; background: #000; }
    </style>
  </head>
  <body>
    <div class="card">
      <h2>HLS Video Player</h2>
      <video id="video" controls playsinline autoplay muted></video>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
    <script>
      const video = document.getElementById('video');
      const src = '/video/hls/360p.m3u8';

      if (window.Hls && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else {
        video.innerHTML = '<p>Your browser does not support HLS playback.</p>';
      }
    </script>
  </body>
</html>`;
  }

  getPlaylist(playlistName = 'index.m3u8'): string {
    const playlistPath = path.join(this.hlsRoot, playlistName);
    if (!fs.existsSync(playlistPath)) {
      throw new NotFoundException('HLS playlist not found');
    }

    const content = fs.readFileSync(playlistPath, 'utf8');
    return content
      .split('\n')
      .map((raw) => {
        const line = raw.trim();
        if (!line || line.startsWith('#')) {
          return raw;
        }

        if (line.toLowerCase().endsWith('.ts')) {
          return `/video/hls/${line}`;
        }

        return raw;
      })
      .join('\n');
  }

  getSegment(segmentName: string): StreamableFile {
    const segmentPath = path.join(this.hlsRoot, segmentName);
    if (!fs.existsSync(segmentPath)) {
      throw new NotFoundException('HLS segment not found');
    }

    return new StreamableFile(fs.createReadStream(segmentPath));
  }
}
