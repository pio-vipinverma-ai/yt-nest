
import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
// import ffmpegPath from 'ffmpeg-static';

@Injectable()
export class VideoService {
  private readonly hlsRoot = path.join(
    process.cwd(),
    'storage',
    'hls',
  );
  private ffmpegProcess: ReturnType<typeof spawn> | null = null;
  //private recordingProcess: ReturnType<typeof spawn> | null = null;

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

  buildFfmpegArgs(outputDir: string, recordingFile: string): string[] {
    // const outputFile = path.join(outputDir, 'index.m3u8').split(path.sep).join('/');
    const inputSource = process.env.FFMPEG_INPUT || (process.platform === 'win32' ? 'video=Integrated Camera:audio=Microphone (Realtek(R) Audio)' : '0');

    const outputFile = path
    .join(outputDir, 'index.m3u8')
    .replace(/\\/g, '/');

    const recordingFileNormalized =
    recordingFile.replace(/\\/g, '/');

    console.log(
      'TEE OUTPUT:',
      `[f=hls:hls_time=1:hls_list_size=2:hls_flags=delete_segments]${outputFile}|[f=mp4]${recordingFileNormalized}`,
    );

    return [
        '-y',
        '-f',
        'dshow',
        '-i',
        'video=Integrated Camera:audio=Microphone (Realtek(R) Audio)',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-preset',
        'ultrafast',
        '-tune',
        'zerolatency',
        '-g',
        '30',
        '-keyint_min',
        '30',
        '-fflags',
        'nobuffer',
        '-flags',
        'low_delay',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        '-ar',
        '44100',
        '-ac',
        '2',
        // '-hls_time',
        // '1',
        // '-hls_list_size',
        // '2',
        // '-hls_flags',
        // 'delete_segments',
        
        '-map',
        '0:v:0',
        '-map',
        '0:a:0',

        '-flags',
        '+global_header',

        '-f',
        'tee',

        `[f=hls:hls_time=1:hls_list_size=2:hls_flags=delete_segments]${outputFile}|[f=mp4:movflags=+faststart+frag_keyframe+empty_moov]${recordingFileNormalized}`,

      ];
  }
  

  async startLiveStream(): Promise<void> {
    if (this.ffmpegProcess) {
      return;
    }

    const outputDir = path.join(this.hlsRoot, 'live');
    fs.mkdirSync(outputDir, { recursive: true });

    const recordingDir = path.join(
      process.cwd(),
      'storage',
      'recordings',
    );

    fs.mkdirSync(recordingDir, {
      recursive: true,
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');

    const recordingFile = path.join(
      recordingDir,
      `recording-${timestamp}.mp4`,
    );
    //const args = this.buildFfmpegArgs(outputDir);
    const args = this.buildFfmpegArgs(
      outputDir,
      recordingFile,
    );

    console.log('-----------------------------args----------',args);
    
console.log('----------Recording File:', recordingFile);
console.log('-----------Recording Exists:', fs.existsSync(recordingFile));
console.log('-----------Recording Dir:', fs.existsSync(recordingDir));




    //const ffmpegExecutable = typeof ffmpegPath === 'string' ? ffmpegPath : 'ffmpeg';
    const ffmpegExecutable = 'ffmpeg';

    console.log('Starting FFmpeg HLS stream for local camera...');
    
    
    
    // const recordingArgs = [
    //   '-y',

    //   '-f',
    //   'dshow',

    //   '-i',
    //   'video=Integrated Camera:audio=Microphone (Realtek(R) Audio)',

    //   '-c:v',
    //   'libx264',

    //   '-c:a',
    //   'aac',

    //   recordingFile,
    // ];
  
    const processRef = spawn(
      'C:\\Users\\VipinVerma\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe',
      args,
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    // const recordingRef = spawn(
    //   'C:\\Users\\VipinVerma\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe',
    //   recordingArgs,
    //   {
    //     cwd: process.cwd(),
    //     stdio: ['ignore', 'pipe', 'pipe'],
    //   },
    // );

    // this.recordingProcess = recordingRef;

    
    // recordingRef.on('spawn', () => {
    //   console.log('Recording started:', recordingFile);
    // });

    // recordingRef.stderr?.on('data', (chunk) => {
    //   console.log(`[recording] ${chunk.toString()}`);
    // });

    // recordingRef.on('exit', (code) => {
    //   console.log(`Recording stopped. Exit code=${code}`);
    // });


    processRef.on('spawn', () => {
      console.log('FFmpeg started successfully');
    });

    console.log(args);
    console.log('1111111111111111111111111111111111111');



    this.ffmpegProcess = processRef;

    processRef.stdout?.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) {
        console.log(`[ffmpeg] ${text}`);
      }
    });

    processRef.stderr?.on('data', (chunk) => {
      const text = chunk.toString().trim();
      if (text) {
        console.error(`[ffmpeg] ${text}`);
      }

      console.error(chunk.toString());
    });

    processRef.on('error', (error) => {
      console.error('Failed to start FFmpeg process:', error);
      this.ffmpegProcess = null;
    });

    processRef.on('exit', (code, signal) => {
      console.log(`FFmpeg exited with code ${code} and signal ${signal}`);
      this.ffmpegProcess = null;
    });
  }

  
stopLiveStream(): void {
  if (this.ffmpegProcess) {
    this.ffmpegProcess.stdin?.write('q');
    this.ffmpegProcess = null;
  }
}


  getMasterPlaylist(): string {
    return [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360,NAME="live"',
      '/live/index.m3u8',
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
      const src = '/live/index.m3u8';

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
    const playlistPath = path.join(this.hlsRoot, 'live', playlistName);
    if (!fs.existsSync(playlistPath)) {
      throw new NotFoundException('HLS playlist not found');
    }

    return fs.readFileSync(playlistPath, 'utf8');
  }

  getSegment(segmentName: string): StreamableFile {
    const segmentPath = path.join(this.hlsRoot, 'live', segmentName);
    if (!fs.existsSync(segmentPath)) {
      throw new NotFoundException('HLS segment not found');
    }

    return new StreamableFile(fs.createReadStream(segmentPath));
  }
}
