import { H as Hls } from "./video-player-dru42stk.js";

function initHlsPlayer(wrapper) {
  var video = wrapper.querySelector("video");
  var playButton = wrapper.querySelector("[data-video-play]");
  var message = wrapper.querySelector("[data-video-message]");
  var hls = null;
  var initialized = false;

  if (!video) {
    return;
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function destroyHls() {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  }

  function loadSource(source) {
    if (!source) {
      setMessage("暂无可用播放地址");
      return;
    }

    destroyHls();
    initialized = true;
    wrapper.setAttribute("data-hls-src", source);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setMessage("高清线路已就绪");
      });

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage("网络加载异常，正在重试");
          hls.startLoad();
          return;
        }

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage("媒体解码异常，正在恢复");
          hls.recoverMediaError();
          return;
        }

        setMessage("当前线路无法播放，请尝试备用线路");
        destroyHls();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      setMessage("浏览器原生 HLS 已就绪");
    } else {
      video.src = source;
      setMessage("浏览器可能不支持 HLS，请更换浏览器尝试");
    }
  }

  function play() {
    var source = wrapper.getAttribute("data-hls-src");

    if (!initialized) {
      loadSource(source);
    }

    video.play().then(function () {
      if (playButton) {
        playButton.classList.add("is-hidden");
      }
      setMessage("正在播放");
    }).catch(function () {
      setMessage("请再次点击播放按钮开始播放");
    });
  }

  if (playButton) {
    playButton.addEventListener("click", play);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener("pause", function () {
    if (playButton) {
      playButton.classList.remove("is-hidden");
    }
  });

  video.addEventListener("play", function () {
    if (playButton) {
      playButton.classList.add("is-hidden");
    }
  });

  var sourceButtons = document.querySelectorAll("[data-hls-source]");
  sourceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      sourceButtons.forEach(function (item) {
        item.classList.remove("active");
      });
      button.classList.add("active");
      loadSource(button.getAttribute("data-hls-source"));
      play();
    });
  });
}

document.querySelectorAll("[data-hls-player]").forEach(initHlsPlayer);
