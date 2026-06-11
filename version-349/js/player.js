function initializeMoviePlayer(options) {
    var video = document.querySelector(options.videoSelector);
    var button = document.querySelector(options.buttonSelector);
    var overlay = document.querySelector(options.overlaySelector);
    var attached = false;
    var hlsInstance = null;

    if (!video || !button || !overlay || !options.source) {
        return;
    }

    function attach() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = options.source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(options.source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = options.source;
        }
    }

    function begin() {
        overlay.classList.add('is-hidden');
        attach();
        var request = video.play();
        if (request && typeof request.catch === 'function') {
            request.catch(function () {});
        }
    }

    button.addEventListener('click', begin);
    overlay.addEventListener('click', begin);
    video.addEventListener('click', function () {
        if (!attached) {
            begin();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}