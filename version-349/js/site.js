(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === active);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === active);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener('click', function () {
                show(position);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(active - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]')).forEach(function (scope) {
        var input = scope.querySelector('[data-filter-search]');
        var year = scope.querySelector('[data-filter-year]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var keyword = normalize(input && input.value);
            var selectedYear = year ? year.value : '';
            var selectedRegion = region ? region.value : '';
            var selectedType = type ? type.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-text'));
                var cardYear = card.getAttribute('data-year') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }

                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }

                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });

        apply();
    });
})();