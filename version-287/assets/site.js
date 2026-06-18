(function () {
    var navButton = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var currentSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        window.clearInterval(timer);
        timer = window.setInterval(nextSlide, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-slide-target') || 0));
            startHero();
        });
    });

    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(currentSlide - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(currentSlide + 1);
            startHero();
        });
    }

    startHero();

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.page-search'));

    function filterCards(input) {
        var list = input.closest('.filter-section');
        var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
        var value = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
            card.classList.toggle('is-hidden-card', value && text.indexOf(value) === -1);
        });
    }

    searchInputs.forEach(function (input) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');

        if (q) {
            input.value = q;
            filterCards(input);
        }

        input.addEventListener('input', function () {
            filterCards(input);
        });
    });

    var filterChips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));

    filterChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var section = chip.closest('.filter-section');
            var cards = section ? Array.prototype.slice.call(section.querySelectorAll('.movie-card')) : [];
            var value = chip.getAttribute('data-filter') || '全部';

            if (section) {
                Array.prototype.slice.call(section.querySelectorAll('.filter-chip')).forEach(function (item) {
                    item.classList.toggle('is-active', item === chip);
                });
            }

            cards.forEach(function (card) {
                var text = card.getAttribute('data-meta') || '';
                card.classList.toggle('is-hidden-card', value !== '全部' && text.indexOf(value) === -1);
            });
        });
    });

    var firstChip = document.querySelector('.filter-chip');

    if (firstChip) {
        firstChip.classList.add('is-active');
    }

    var rankTabs = Array.prototype.slice.call(document.querySelectorAll('.rank-tab'));

    function showRankGroup(group) {
        Array.prototype.slice.call(document.querySelectorAll('.ranking-row')).forEach(function (row) {
            var matched = row.getAttribute('data-rank-group') === group;
            row.classList.toggle('is-visible', matched);
            if (!matched) {
                row.classList.remove('is-visible');
            }
        });
    }

    rankTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            rankTabs.forEach(function (item) {
                item.classList.toggle('is-active', item === tab);
            });
            showRankGroup(tab.getAttribute('data-rank-target') || 'hot');
        });
    });

    if (rankTabs.length) {
        showRankGroup('hot');
    }
})();

function initPlayer(source) {
    var video = document.getElementById('movie-player');
    var overlay = document.querySelector('.player-overlay');
    var hls = null;
    var ready = false;

    if (!video || !source) {
        return;
    }

    function attach() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function play() {
        attach();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var result = video.play();

        if (result && typeof result.catch === 'function') {
            result.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('ended', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
