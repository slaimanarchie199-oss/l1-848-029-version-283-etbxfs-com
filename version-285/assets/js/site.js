(function () {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (button && nav) {
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var index = 0;

        var showSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });

            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
            });
        };

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                showSlide(itemIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var input = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var regionFilter = document.querySelector("[data-filter-region]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));

    if (regionFilter && cards.length) {
        var regions = cards.map(function (card) {
            return card.getAttribute("data-region") || "";
        }).filter(function (value, itemIndex, array) {
            return value && array.indexOf(value) === itemIndex;
        }).sort();

        regions.forEach(function (region) {
            var option = document.createElement("option");
            option.value = region;
            option.textContent = region;
            regionFilter.appendChild(option);
        });
    }

    var runFilter = function () {
        var query = input ? input.value.trim().toLowerCase() : "";
        var year = yearFilter ? yearFilter.value : "";
        var region = regionFilter ? regionFilter.value : "";

        cards.forEach(function (card) {
            var text = (card.getAttribute("data-search") || "").toLowerCase();
            var cardYear = card.getAttribute("data-year") || "";
            var cardRegion = card.getAttribute("data-region") || "";
            var matched = true;

            if (query && text.indexOf(query) === -1) {
                matched = false;
            }

            if (year && cardYear !== year) {
                matched = false;
            }

            if (region && cardRegion !== region) {
                matched = false;
            }

            card.classList.toggle("hidden", !matched);
        });
    };

    if (input) {
        input.addEventListener("input", runFilter);
    }

    if (yearFilter) {
        yearFilter.addEventListener("change", runFilter);
    }

    if (regionFilter) {
        regionFilter.addEventListener("change", runFilter);
    }
})();

function initVideoPlayback(streamUrl) {
    var video = document.getElementById("video-player");
    var playButton = document.getElementById("play-button");
    var hlsPlayer = null;
    var prepared = false;

    if (!video || !playButton || !streamUrl) {
        return;
    }

    var prepare = function () {
        if (prepared) {
            return;
        }

        prepared = true;
        video.controls = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsPlayer = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsPlayer.loadSource(streamUrl);
            hlsPlayer.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };

    var play = function () {
        prepare();
        playButton.classList.add("is-hidden");
        var action = video.play();

        if (action && typeof action.catch === "function") {
            action.catch(function () {
                playButton.classList.remove("is-hidden");
            });
        }
    };

    playButton.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("play", function () {
        playButton.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        playButton.classList.remove("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsPlayer) {
            hlsPlayer.destroy();
        }
    });
}
