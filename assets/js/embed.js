(function () {
  "use strict";
  const C = window.KartografiCharts;
  const view = document.body.dataset.view;
  const chart = document.getElementById("embed-chart");
  const title = document.getElementById("embed-title");
  const subtitle = document.getElementById("embed-subtitle");
  const controls = document.getElementById("embed-controls");

  function optionSelect(summary, metric, defaultGenre) {
    const select = document.createElement("select");
    select.className = "embed-select";
    select.setAttribute("aria-label", "Pilih genre");
    const all = document.createElement("option");
    all.value = "";
    all.textContent = "Semua genre";
    select.appendChild(all);
    summary.orders.genres.forEach(genre => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      if (genre === defaultGenre) option.selected = true;
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      const active = select.value ? [select.value] : [];
      C.drawHeatmap(chart, summary, metric, active);
    });
    controls.appendChild(select);
    return select;
  }

  fetch("../data/summary.json")
    .then(response => {
      if (!response.ok) throw new Error(`summary.json: ${response.status}`);
      return response.json();
    })
    .then(summary => {
      if (view === "genre") {
        title.textContent = "Overlap Genre";
        subtitle.textContent = "Koefisien overlap dihitung sebagai jumlah irisan dibagi jumlah buku pada genre yang lebih kecil.";
        C.drawGenreChart(chart, summary, "all");
      }
      if (view === "warna") {
        title.textContent = "Peta Panas Distribusi Warna";
        subtitle.textContent = "Rata-rata proporsi piksel dari lima warna utama setiap sampul.";
        const select = optionSelect(summary, "colors", "Romansa");
        C.drawHeatmap(chart, summary, "colors", [select.value]);
      }
      if (view === "tipografi") {
        title.textContent = "Peta Panas Tipografi";
        subtitle.textContent = "Distribusi Serif, Script, Sans-serif, dan Fancy pada genre terpilih.";
        const select = optionSelect(summary, "typefaces", "Fiksi Sejarah");
        C.drawHeatmap(chart, summary, "typefaces", [select.value]);
      }
      if (view === "ilustrasi") {
        title.textContent = "Peta Panas Gaya Ilustrasi";
        subtitle.textContent = "Distribusi sepuluh kategori gaya ilustrasi pada genre terpilih.";
        const select = optionSelect(summary, "illustrations", "Horor");
        C.drawHeatmap(chart, summary, "illustrations", [select.value]);
      }
    })
    .catch(error => {
      console.error(error);
      chart.innerHTML = '<p class="chart-empty">Visual gagal dimuat. Gunakan server HTTP, bukan membuka berkas melalui file://.</p>';
    });
})();
