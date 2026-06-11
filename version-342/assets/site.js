const navToggle = document.querySelector("[data-nav-toggle]");
const siteNav = document.querySelector("[data-site-nav]");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    siteNav.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  };

  const startTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startTimer();
    });
  });

  if (prev) {
    prev.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      startTimer();
    });
  }

  if (next) {
    next.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      startTimer();
    });
  }

  startTimer();
}

const localFilter = document.querySelector("[data-local-filter]");
const archiveSearch = document.querySelector("[data-archive-search]");
const searchInput = localFilter || archiveSearch;

const applyFilter = (value) => {
  const query = value.trim().toLowerCase();
  const items = Array.from(document.querySelectorAll("[data-search-item]"));

  items.forEach((item) => {
    const haystack = [
      item.dataset.title,
      item.dataset.year,
      item.dataset.type,
      item.dataset.region,
      item.dataset.genre,
      item.dataset.tags
    ].join(" ").toLowerCase();
    item.classList.toggle("is-hidden", query.length > 0 && !haystack.includes(query));
  });

  document.querySelectorAll("[data-archive-year]").forEach((group) => {
    const visibleItems = group.querySelectorAll("[data-search-item]:not(.is-hidden)");
    group.classList.toggle("is-empty", visibleItems.length === 0);
  });
};

if (searchInput) {
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  searchInput.value = initialQuery;
  applyFilter(initialQuery);

  searchInput.addEventListener("input", () => {
    applyFilter(searchInput.value);
  });
}

const backTop = document.querySelector("[data-back-top]");

if (backTop) {
  window.addEventListener("scroll", () => {
    backTop.classList.toggle("is-visible", window.scrollY > 360);
  });

  backTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
