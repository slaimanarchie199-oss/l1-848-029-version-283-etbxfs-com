(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function initNavigation() {
    var toggle = qs('[data-nav-toggle]');
    var mobile = qs('[data-mobile-nav]');

    if (!toggle || !mobile) {
      return;
    }

    toggle.addEventListener('click', function () {
      mobile.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = qs('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = qsa('[data-hero-slide]', carousel);
    var dots = qsa('[data-hero-dot]', carousel);
    var prev = qs('[data-hero-prev]', carousel);
    var next = qs('[data-hero-next]', carousel);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function autoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        autoPlay();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        autoPlay();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        autoPlay();
      });
    });

    show(0);
    autoPlay();
  }

  function initCardFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var search = qs('[data-card-search]', scope);
      var year = qs('[data-card-year]', scope);
      var type = qs('[data-card-type]', scope);
      var section = scope.closest('section');
      var cards = qsa('.movie-card', section || document);
      var empty = qs('[data-empty-state]', section || document);

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : '';
        var selectedYear = year ? year.value : '';
        var selectedType = type ? type.value : '';
        var shown = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.category
          ].join(' ').toLowerCase();
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }

          if (selectedYear && card.dataset.year !== selectedYear) {
            ok = false;
          }

          if (selectedType && card.dataset.type !== selectedType) {
            ok = false;
          }

          card.hidden = !ok;

          if (ok) {
            shown += 1;
          }
        });

        if (empty) {
          empty.hidden = shown !== 0;
        }
      }

      [search, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function renderMovieCard(movie) {
    var tags = (movie.genres || []).concat(movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '    <div class="poster-box">',
      '      <img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 封面" loading="lazy" onerror="this.classList.add(\'is-missing\');">',
      '      <div class="poster-fallback"><span>' + escapeHtml(movie.title.slice(0, 8)) + '</span></div>',
      '      <span class="poster-year">' + escapeHtml(movie.year) + '</span>',
      '      <span class="poster-play">▶</span>',
      '    </div>',
      '  </a>',
      '  <div class="movie-info">',
      '    <a class="movie-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.type) + '</span>',
      '      <span>评分 ' + escapeHtml(movie.rating) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <a class="category-pill" href="category/' + escapeHtml(movie.categorySlug) + '.html">' + escapeHtml(movie.category) + '</a>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function initSearchPage() {
    var root = qs('[data-search-page]');
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');

    if (!root || !results || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }

    var keyword = qs('[data-global-search]', root);
    var year = qs('[data-global-year]', root);
    var type = qs('[data-global-type]', root);
    var reset = qs('[data-global-reset]', root);

    function apply() {
      var q = keyword ? keyword.value.trim().toLowerCase() : '';
      var y = year ? year.value : '';
      var t = type ? type.value : '';
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.category,
          movie.oneLine,
          (movie.genres || []).join(' '),
          (movie.tags || []).join(' ')
        ].join(' ').toLowerCase();

        if (q && text.indexOf(q) === -1) {
          return false;
        }

        if (y && String(movie.year) !== y) {
          return false;
        }

        if (t && movie.type !== t) {
          return false;
        }

        return true;
      }).sort(function (a, b) {
        return b.year - a.year || b.heat - a.heat;
      }).slice(0, 180);

      results.innerHTML = list.map(renderMovieCard).join('\n');

      if (summary) {
        summary.textContent = '共找到 ' + list.length + ' 条匹配内容，最多显示前 180 条。';
      }
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }

        if (year) {
          year.value = '';
        }

        if (type) {
          type.value = '';
        }

        apply();
      });
    }
  }

  function initPlayers() {
    qsa('[data-player-card]').forEach(function (card) {
      var video = qs('video[data-src]', card);
      var button = qs('[data-player-start]', card);
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function loadAndPlay() {
        var source = video.dataset.src;

        if (!source) {
          button.innerHTML = '<strong>播放源未配置</strong>';
          return;
        }

        button.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          if (!video.src) {
            video.src = source;
          }

          video.play().catch(function () {
            button.classList.remove('is-hidden');
          });
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          if (!hlsInstance) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          }

          video.play().catch(function () {
            button.classList.remove('is-hidden');
          });
          return;
        }

        video.src = source;
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      }

      button.addEventListener('click', loadAndPlay);
      video.addEventListener('click', function () {
        if (!video.src) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.currentTime) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initCardFilters();
    initSearchPage();
    initPlayers();
  });
})();
