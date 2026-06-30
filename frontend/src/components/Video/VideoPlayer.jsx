import React from "react";

function VideoPlayer() {
  return (
    <div>
      <video
        width="800"
        controls
        autoPlay
        muted
        playsInline
        style={{ borderRadius: "8px" }}
        >
        http://localhost:3002/video/stream
</video>
    </div>
  );
}

export default VideoPlayer;
``