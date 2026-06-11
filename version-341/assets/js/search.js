(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\">" +
      "  <a class=\"movie-card-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "    <div class=\"poster-wrap\">" +
      "      <img src=\"" + escapeHtml(movie.poster) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" onerror=\"this.style.display='none'; this.closest('.poster-wrap').classList.add('image-missing');\">" +
      "      <span class=\"poster-fallback\">国产影视大全</span>" +
      "      <span class=\"poster-duration\">" + escapeHtml(movie.duration) + "</span>" +
      "      <span class=\"poster-play\">▶</span>" +
      "    </div>" +
      "    <div class=\"movie-card-body\">" +
      "      <div class=\"movie-meta-row\">" +
      "        <span class=\"category-pill\">" + escapeHtml(movie.categoryName) + "</span>" +
      "        <span>" + escapeHtml(movie.year) + "</span>" +
      "      </div>" +
      "      <h3>" + escapeHtml(movie.title) + "</h3>" +
      "      <p class=\"card-summary\">" + escapeHtml(movie.oneLine) + "</p>" +
      "      <div class=\"tag-list\">" + tags + "</div>" +
      "      <div class=\"movie-stats\">" +
      "        <span>⭐ " + escapeHtml(movie.score) + "</span>" +
      "        <span>" + escapeHtml(movie.views) + " 次观看</span>" +
      "      </div>" +
      "    </div>" +
      "  </a>" +
      "</article>";
  }

  ready(function () {
    var movies = window.MOVIE_INDEX || [];
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var category = document.querySelector("[data-search-category]");
    var sort = document.querySelector("[data-search-sort]");
    var summary = document.querySelector("[data-search-summary]");
    var results = document.querySelector("[data-search-results]");
    var params = new URLSearchParams(window.location.search);

    if (!results || !summary) {
      return;
    }

    if (input) {
      input.value = params.get("q") || "";
    }

    if (sort && params.get("sort")) {
      sort.value = params.get("sort");
    }

    function applySearch() {
      var query = normalize(input ? input.value : "");
      var categoryValue = category ? category.value : "";
      var sortValue = sort ? sort.value : "relevance";
      var queryParts = query.split(/\s+/).filter(Boolean);

      var filtered = movies.filter(function (movie) {
        if (categoryValue && movie.categorySlug !== categoryValue) {
          return false;
        }

        if (!queryParts.length) {
          return true;
        }

        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.categoryName,
          (movie.tags || []).join(" "),
          movie.oneLine
        ].join(" "));

        return queryParts.every(function (part) {
          return haystack.indexOf(part) !== -1;
        });
      });

      filtered.sort(function (a, b) {
        if (sortValue === "latest") {
          return b.year - a.year || b.views - a.views;
        }
        if (sortValue === "views") {
          return b.views - a.views;
        }
        if (sortValue === "score") {
          return b.score - a.score || b.views - a.views;
        }
        return b.score - a.score || b.views - a.views;
      });

      var visible = filtered.slice(0, 120);
      results.innerHTML = visible.map(movieCard).join("\n");
      summary.textContent = "找到 " + filtered.length + " 部影片，当前显示前 " + visible.length + " 部。";
    }

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applySearch();
      });
    }

    if (input) {
      input.addEventListener("input", applySearch);
    }

    if (category) {
      category.addEventListener("change", applySearch);
    }

    if (sort) {
      sort.addEventListener("change", applySearch);
    }

    applySearch();
  });
})();
