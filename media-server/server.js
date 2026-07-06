const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);

nms.on('postPublish', (id, StreamPath) => {
  console.log('Publish Success:', StreamPath);
});

nms.run();