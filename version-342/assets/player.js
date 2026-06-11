const players = document.querySelectorAll("[data-player]");

players.forEach((player) => {
  const video = player.querySelector("video");
  const button = player.querySelector("[data-play-button]");
  const source = player.dataset.source;
  let started = false;
  let hlsInstance = null;

  const begin = async () => {
    if (!video || !source) {
      return;
    }

    if (button) {
      button.classList.add("is-hidden");
    }

    if (started) {
      video.play().catch(() => {});
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.play().catch(() => {});
      return;
    }

    try {
      const module = await import("./hls-dru42stk.js");
      const Hls = module.H || module.default || window.Hls;

      if (Hls && Hls.isSupported && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data && data.fatal) {
            video.src = source;
            video.play().catch(() => {});
          }
        });
        return;
      }
    } catch (error) {
      video.src = source;
      video.play().catch(() => {});
      return;
    }

    video.src = source;
    video.play().catch(() => {});
  };

  if (button) {
    button.addEventListener("click", begin);
  }

  if (video) {
    video.addEventListener("click", () => {
      if (!started || video.paused) {
        begin();
      }
    });

    video.addEventListener("emptied", () => {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }
});
