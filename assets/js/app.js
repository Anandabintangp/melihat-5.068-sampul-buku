(function () {
  "use strict";

  const C = window.KartografiCharts;
  const config = window.KARTOGRAFI_CONFIG || {};
  let summary;
  const currentStates = { genre: "all", warna: "global", tipografi: "global", ilustrasi: "global" };

  function rootRelative(path) { return new URL(path, document.baseURI).href; }
  function isLocal() { return ["localhost", "127.0.0.1", ""].includes(window.location.hostname); }
  function coverUrl(filename, remote = false) {
    const base = remote ? config.productionCoverBase : (isLocal() ? config.localCoverBase : config.productionCoverBase);
    return new URL(filename, new URL(base, document.baseURI)).href;
  }
  function attachCoverFallback(img, filename, color) {
    img.addEventListener("error", function retry() {
      img.removeEventListener("error", retry);
      if (!img.dataset.remoteTried) {
        img.dataset.remoteTried = "1";
        img.src = coverUrl(filename, true);
      } else {
        img.style.display = "none";
        if (img.parentElement) img.parentElement.style.background = C.COLORS[color] || "#3a352f";
      }
    });
  }
  function formatStat(key, value) {
    if (key.endsWith("pct")) return C.fmt(value);
    return C.fmtInt(value);
  }
  function fillStats() {
    document.querySelectorAll("[data-stat]").forEach(node => {
      const key = node.dataset.stat;
      if (summary.metadata[key] !== undefined) node.textContent = formatStat(key, summary.metadata[key]);
    });
    const status = document.getElementById("data-build-status");
    if (status) status.textContent = `Data terverifikasi dari ${summary.generated_from}`;
    document.querySelectorAll("[data-dashboard-link]").forEach(link => { link.href = config.dashboardUrl || link.href; });
  }

  function buildHeroWall() {
    const wall = document.getElementById("cover-wall");
    summary.hero_books.forEach((book, index) => {
      const tile = document.createElement("div");
      tile.className = "cover-tile";
      tile.style.background = C.COLORS[book.dominant_color] || "#3a352f";
      const img = document.createElement("img");
      img.alt = "";
      img.loading = index < 50 ? "eager" : "lazy";
      img.decoding = "async";
      img.src = coverUrl(book.image);
      attachCoverFallback(img, book.image, book.dominant_color);
      tile.appendChild(img);
      wall.appendChild(tile);
    });
  }

  function buildClosingCovers() {
    const container = document.getElementById("closing-covers");
    summary.hero_books.slice(0, 30).forEach(book => {
      const img = document.createElement("img");
      img.loading = "lazy";
      img.decoding = "async";
      img.alt = `${book.title || "Sampul buku"}, ${book.author || "penulis tidak tercatat"}`;
      img.title = img.alt;
      img.src = coverUrl(book.image);
      attachCoverFallback(img, book.image, book.dominant_color);
      container.appendChild(img);
    });
  }

  const colorStates = {
    global: { title: "Distribusi warna seluruh korpus", active: [], bar: "global", caption: "Seluruh nilai dihitung dari rata-rata proporsi piksel pada lima warna utama setiap sampul." },
    populer: { title: "Homogenisasi warna pada fiksi populer", active: summary => summary.groups.populer, bar: "Romansa", caption: "Bar menampilkan Romansa sebagai contoh. Peta panas menyoroti seluruh genre fiksi populer." },
    gelap: { title: "Horor dan Thriller/Misteri", active: ["Horor", "Thriller/Misteri"], bar: "Horor", caption: "Bar menampilkan Horor. Peta panas memperlihatkan perbandingannya dengan Thriller/Misteri." },
    biru: { title: "Genre spekulatif dan perjalanan", active: ["Fantasi", "Fiksi Sains", "Aksi", "Petualangan"], bar: "Fiksi Sains", caption: "Bar menampilkan Fiksi Sains. Biru tidak selalu menjadi warna pertama pada seluruh genre yang disorot." },
    konteks: { title: "Satu warna, konteks yang berbeda", active: ["Fiksi Sejarah", "Anak-anak", "Komedi"], bar: "Fiksi Sejarah", caption: "Bar menampilkan Fiksi Sejarah. Makna warna dibentuk melalui kombinasi, bukan melalui satu warna tunggal." }
  };

  function renderGenre(state) {
    currentStates.genre = state;
    C.drawGenreChart("genre-chart", summary, state);
    updateControls("genre", state);
  }

  function renderWarna(state) {
    currentStates.warna = state;
    const spec = colorStates[state];
    const active = typeof spec.active === "function" ? spec.active(summary) : spec.active;
    const distribution = spec.bar === "global" ? summary.global.colors : summary.genres[spec.bar].colors;
    document.getElementById("warna-title").textContent = spec.title;
    C.drawStackedBar("warna-bar", distribution, summary.orders.colors, C.COLORS);
    C.drawHeatmap("warna-chart", summary, "colors", active, { dark: true });
    document.getElementById("warna-caption").textContent = spec.caption;
    updateControls("warna", state);
  }

  function renderTipografi(state) {
    currentStates.tipografi = state;
    const chart = document.getElementById("tipografi-chart");
    const title = document.getElementById("tipografi-title");
    const caption = document.getElementById("tipografi-caption");
    if (state === "global") {
      title.textContent = "Distribusi typeface seluruh korpus";
      C.drawHorizontalDistribution(chart, summary.global.typeface_pct, summary.orders.typefaces, C.TF_COLORS);
      C.renderFonts("font-detail", summary.genres["Fiksi Sejarah"].top_fonts.slice(0, 5));
      caption.textContent = "Serif mencakup 46,2% korpus, disusul Script 27,7%.";
    } else if (state === "formal") {
      title.textContent = "Typeface pada genre formal dan gelap";
      C.drawHeatmap(chart, summary, "typefaces", ["Fiksi Sejarah", "Thriller/Misteri", "Horor"]);
      C.renderFonts("font-detail", summary.genres["Fiksi Sejarah"].top_fonts);
      caption.textContent = "Rozha One muncul pada 21,3% Fiksi Sejarah. Dominasi Serif tidak menghapus variasi font di dalamnya.";
    } else if (state === "romansa") {
      title.textContent = "Script pada fiksi populer";
      C.drawHeatmap(chart, summary, "typefaces", summary.groups.populer);
      C.renderFonts("font-detail", summary.genres.Romansa.top_fonts);
      caption.textContent = "Pada Romansa, Script 35,9% sedikit lebih tinggi daripada Serif 32,9%.";
    } else {
      title.textContent = "Audit ketidakpastian tipografi";
      C.drawHorizontalDistribution(chart, summary.global.typeface_pct, summary.orders.typefaces, C.TF_COLORS);
      C.renderFonts("font-detail", []);
      caption.textContent = `${C.fmt(summary.metadata.typeface_low_conf_pct)}% sampul ditandai berkepercayaan rendah. Visual harus dibaca sebagai kecenderungan agregat.`;
    }
    updateControls("tipografi", state);
  }

  function renderIlustrasi(state) {
    currentStates.ilustrasi = state;
    const chart = document.getElementById("ilustrasi-chart");
    const title = document.getElementById("ilustrasi-title");
    const caption = document.getElementById("ilustrasi-caption");
    if (state === "global") {
      title.textContent = "Distribusi gaya ilustrasi seluruh korpus";
      C.drawHorizontalDistribution(chart, summary.global.illustration_pct, summary.orders.illustrations, C.IL_COLORS, summary.labels.illustrations);
      caption.textContent = "Kartunal, Minimalis, dan Ekspresionisme merupakan tiga kategori terbesar.";
    } else if (state === "tren") {
      title.textContent = "Tren Kartunal dan Minimalis, 2000–2025";
      C.drawTrend(chart, summary, ["kartunal", "minimalis"]);
      caption.textContent = "Persentase tahunan perlu dibaca bersama jumlah sampul pada tiap tahun.";
    } else if (state === "anak") {
      title.textContent = "Anak-anak dan Komedi";
      C.drawHeatmap(chart, summary, "illustrations", ["Anak-anak", "Komedi"], { dark: true });
      caption.textContent = "Kartunal mencapai 61,7% pada Anak-anak dan 62,1% pada Komedi.";
    } else if (state === "horor") {
      title.textContent = "Horor dan Thriller/Misteri";
      C.drawHeatmap(chart, summary, "illustrations", ["Horor", "Thriller/Misteri"], { dark: true });
      caption.textContent = "Horor lebih terkonsentrasi pada Ekspresionisme, sedangkan Thriller/Misteri lebih tersebar.";
    } else {
      title.textContent = "Fiksi Sejarah dan dunia spekulatif";
      C.drawHeatmap(chart, summary, "illustrations", ["Fiksi Sejarah", "Fiksi Sains", "Fantasi", "Petualangan"], { dark: true });
      caption.textContent = "Kategori imajinatif memperlihatkan strategi visual yang berbeda, bukan satu kode tunggal.";
    }
    updateControls("ilustrasi", state);
  }

  function updateControls(section, state) {
    document.querySelectorAll(`[data-controls="${section}"] button`).forEach(button => {
      button.setAttribute("aria-pressed", button.dataset.state === state ? "true" : "false");
    });
  }

  function renderSection(section, state) {
    if (section === "genre") renderGenre(state);
    if (section === "warna") renderWarna(state);
    if (section === "tipografi") renderTipografi(state);
    if (section === "ilustrasi") renderIlustrasi(state);
  }

  function setupControls() {
    document.querySelectorAll("[data-controls]").forEach(group => {
      const section = group.dataset.controls;
      group.addEventListener("click", event => {
        const button = event.target.closest("button[data-state]");
        if (!button) return;
        renderSection(section, button.dataset.state);
      });
    });
  }

  function setupScrolly() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const step = entry.target;
        const scrolly = step.closest("[data-scrolly]");
        if (!scrolly) return;
        scrolly.querySelectorAll(".step").forEach(node => node.classList.toggle("is-active", node === step));
        renderSection(scrolly.dataset.scrolly, step.dataset.state);
      });
    }, { rootMargin: "-32% 0px -48% 0px", threshold: 0.05 });
    document.querySelectorAll(".step[data-state]").forEach(step => observer.observe(step));
  }

  function setupNav() {
    const links = Array.from(document.querySelectorAll(".nav-links a"));
    const sections = links.map(link => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach(link => link.setAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}` ? "true" : "false"));
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0.05, 0.2, 0.5] });
    sections.forEach(section => observer.observe(section));
  }

  async function init() {
    try {
      summary = await fetch(rootRelative("./data/summary.json")).then(response => {
        if (!response.ok) throw new Error(`summary.json: ${response.status}`);
        return response.json();
      });
      fillStats();
      buildHeroWall();
      buildClosingCovers();
      renderGenre("all");
      renderWarna("global");
      renderTipografi("global");
      renderIlustrasi("global");
      setupControls();
      setupScrolly();
      setupNav();
    } catch (error) {
      console.error(error);
      const status = document.getElementById("data-build-status");
      if (status) status.textContent = "Data gagal dimuat. Jalankan melalui server lokal, bukan file://";
      document.querySelectorAll(".chart-area").forEach(node => {
        node.innerHTML = `<p class="chart-empty">Visual tidak dapat dimuat. Jalankan <code>python -m http.server</code> dari folder proyek.</p>`;
      });
    }
  }

  init();
})();
