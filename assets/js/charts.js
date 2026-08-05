(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const COLORS = {
    putih: "#eee9df",
    oranye: "#c56631",
    cokelat: "#705143",
    biru: "#456f91",
    merah: "#9a4138",
    pink: "#c9849d",
    hitam: "#24211d",
    kuning: "#d1ae45",
    ungu: "#735e86",
    hijau: "#5d7c61",
    abu: "#8f8b82"
  };
  const TF_COLORS = { Serif: "#433f39", Script: "#9b3f2f", "Sans-serif": "#345a78", Fancy: "#b58432" };
  const IL_COLORS = {
    kartunal: "#9b3f2f", minimalis: "#345a78", ekspresionisme: "#6a4c67",
    fotografi_kolase: "#77736c", abstrak: "#b58432", surealis_absurd: "#4f6f58",
    dekoratif: "#8c6142", pop_art: "#c96c62", realisme: "#4f5f70", kubisme: "#26231f"
  };

  let tooltip;
  function ensureTooltip() {
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.setAttribute("role", "status");
      document.body.appendChild(tooltip);
    }
    return tooltip;
  }
  function showTooltip(event, html) {
    const el = ensureTooltip();
    el.innerHTML = html;
    el.style.left = `${event.clientX}px`;
    el.style.top = `${event.clientY}px`;
    el.classList.add("is-visible");
  }
  function hideTooltip() {
    if (tooltip) tooltip.classList.remove("is-visible");
  }
  function svgEl(name, attrs = {}) {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function fmt(value, digits = 1) {
    return Number(value).toLocaleString("id-ID", { maximumFractionDigits: digits, minimumFractionDigits: digits });
  }
  function fmtInt(value) { return Number(value).toLocaleString("id-ID"); }
  function el(id) { return typeof id === "string" ? document.getElementById(id) : id; }
  function setCaption(id, text) { const node = el(id); if (node) node.textContent = text; }

  function drawGenreChart(container, summary, state = "all") {
    container = el(container);
    if (!container) return;
    clear(container);
    const data = summary.cooccurrence;
    const width = 760;
    const row = 30;
    const margin = { top: 18, right: 54, bottom: 36, left: 215 };
    const height = margin.top + data.length * row + margin.bottom;
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Diagram overlap genre" });
    const plotW = width - margin.left - margin.right;

    [0, 25, 50, 75, 100].forEach(tick => {
      const x = margin.left + plotW * tick / 100;
      svg.appendChild(svgEl("line", { x1: x, y1: margin.top - 8, x2: x, y2: height - margin.bottom + 4, stroke: "currentColor", "stroke-opacity": "0.12" }));
      const label = svgEl("text", { x, y: height - 8, "text-anchor": "middle", fill: "currentColor", "fill-opacity": "0.55", "font-size": "10" });
      label.textContent = `${tick}%`;
      svg.appendChild(label);
    });

    data.forEach((d, i) => {
      const active = state === "all" || d.cluster === state;
      const y = margin.top + i * row;
      const label = svgEl("text", { x: margin.left - 10, y: y + 17, "text-anchor": "end", fill: "currentColor", "font-size": "11", "font-weight": active ? "700" : "400", opacity: active ? "1" : "0.22" });
      label.textContent = `${d.left} ↔ ${d.right}`;
      svg.appendChild(label);

      const bar = svgEl("rect", {
        x: margin.left,
        y: y + 5,
        width: Math.max(1, plotW * d.overlap_coefficient / 100),
        height: 16,
        fill: d.cluster === "romansa" ? "#9b3f2f" : (d.cluster === "novel" ? "#345a78" : "#4f6f58"),
        opacity: active ? "0.92" : "0.12"
      });
      bar.addEventListener("mousemove", event => showTooltip(event,
        `<b>${d.left} dan ${d.right}</b><br>${fmtInt(d.overlap)} buku beririsan.<br>Koefisien overlap: ${fmt(d.overlap_coefficient)}%.<br>Jaccard: ${fmt(d.jaccard)}%.`
      ));
      bar.addEventListener("mouseleave", hideTooltip);
      svg.appendChild(bar);

      const value = svgEl("text", { x: margin.left + plotW * d.overlap_coefficient / 100 + 6, y: y + 17, fill: "currentColor", "font-size": "10", opacity: active ? "0.9" : "0.2" });
      value.textContent = fmt(d.overlap_coefficient);
      svg.appendChild(value);
    });
    container.appendChild(svg);
  }

  function heatColor(value, max, scheme) {
    const t = Math.max(0, Math.min(1, value / max));
    const alpha = 0.06 + t * 0.86;
    if (scheme === "dark") return `rgba(224, 143, 108, ${alpha})`;
    return `rgba(52, 90, 120, ${alpha})`;
  }

  function drawHeatmap(container, summary, metric, activeGenres = [], options = {}) {
    container = el(container);
    if (!container) return;
    clear(container);
    const columns = summary.orders[metric];
    const genres = summary.orders.genres;
    const labelMap = metric === "illustrations" ? summary.labels.illustrations : {};
    const wrapper = document.createElement("div");
    wrapper.className = "heat-scroll";
    const grid = document.createElement("div");
    grid.className = "heatmap";
    grid.style.gridTemplateColumns = `132px repeat(${columns.length}, minmax(38px, 1fr))`;

    const corner = document.createElement("div");
    corner.className = "heat-label";
    grid.appendChild(corner);
    columns.forEach(column => {
      const header = document.createElement("div");
      header.className = "heat-label col";
      header.textContent = labelMap[column] || column;
      grid.appendChild(header);
    });

    const allValues = [];
    genres.forEach(genre => columns.forEach(column => allValues.push(summary.genres[genre][metric][column] || 0)));
    const max = Math.max(...allValues, 1);
    genres.forEach(genre => {
      const isActive = !activeGenres.length || activeGenres.includes(genre);
      const rowLabel = document.createElement("div");
      rowLabel.className = `heat-label row ${isActive ? "heat-row-active" : "heat-row-muted"}`;
      rowLabel.textContent = genre;
      grid.appendChild(rowLabel);
      columns.forEach(column => {
        const value = summary.genres[genre][metric][column] || 0;
        const cell = document.createElement("div");
        cell.className = `heat-cell ${isActive ? "heat-row-active" : "heat-row-muted"}`;
        cell.style.background = heatColor(value, max, options.dark ? "dark" : "light");
        cell.style.color = value / max > 0.57 ? "white" : "inherit";
        cell.textContent = fmt(value);
        cell.tabIndex = 0;
        const tooltipText = `<b>${genre}</b><br>${labelMap[column] || column}: ${fmt(value)}%`;
        cell.addEventListener("mousemove", event => showTooltip(event, tooltipText));
        cell.addEventListener("mouseleave", hideTooltip);
        cell.addEventListener("focus", event => {
          const rect = event.target.getBoundingClientRect();
          showTooltip({ clientX: rect.left, clientY: rect.top }, tooltipText);
        });
        cell.addEventListener("blur", hideTooltip);
        grid.appendChild(cell);
      });
    });
    wrapper.appendChild(grid);
    container.appendChild(wrapper);
  }

  function drawStackedBar(container, distribution, order, palette, labelMap = {}) {
    container = el(container);
    if (!container) return;
    clear(container);
    const bar = document.createElement("div");
    bar.className = "stacked-bar";
    const legend = document.createElement("div");
    legend.className = "stacked-legend";
    order.forEach(key => {
      const value = distribution[key] || 0;
      const segment = document.createElement("div");
      segment.className = "stacked-segment";
      segment.style.width = `${value}%`;
      segment.style.background = palette[key] || "#777";
      segment.addEventListener("mousemove", event => showTooltip(event, `<b>${labelMap[key] || key}</b><br>${fmt(value)}%`));
      segment.addEventListener("mouseleave", hideTooltip);
      bar.appendChild(segment);

      const item = document.createElement("div");
      item.className = "legend-item";
      const swatch = document.createElement("span");
      swatch.className = "legend-swatch";
      swatch.style.background = palette[key] || "#777";
      const text = document.createElement("span");
      text.textContent = `${labelMap[key] || key} ${fmt(value)}%`;
      item.append(swatch, text);
      legend.appendChild(item);
    });
    container.append(bar, legend);
  }

  function drawHorizontalDistribution(container, distribution, order, palette, labelMap = {}) {
    container = el(container);
    if (!container) return;
    clear(container);
    const width = 720;
    const margin = { top: 12, right: 60, bottom: 20, left: 150 };
    const rowH = 44;
    const height = margin.top + order.length * rowH + margin.bottom;
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
    const plotW = width - margin.left - margin.right;
    const max = Math.max(...order.map(k => distribution[k] || 0), 1);
    order.forEach((key, index) => {
      const value = distribution[key] || 0;
      const y = margin.top + index * rowH;
      const label = svgEl("text", { x: margin.left - 12, y: y + 25, "text-anchor": "end", fill: "currentColor", "font-size": "12" });
      label.textContent = labelMap[key] || key;
      svg.appendChild(label);
      const bg = svgEl("rect", { x: margin.left, y: y + 10, width: plotW, height: 18, fill: "currentColor", opacity: "0.08" });
      svg.appendChild(bg);
      const bar = svgEl("rect", { x: margin.left, y: y + 10, width: plotW * value / max, height: 18, fill: palette[key] || "#777", opacity: "0.94" });
      bar.addEventListener("mousemove", event => showTooltip(event, `<b>${labelMap[key] || key}</b><br>${fmt(value)}%`));
      bar.addEventListener("mouseleave", hideTooltip);
      svg.appendChild(bar);
      const amount = svgEl("text", { x: margin.left + plotW * value / max + 7, y: y + 24, fill: "currentColor", "font-size": "11" });
      amount.textContent = `${fmt(value)}%`;
      svg.appendChild(amount);
    });
    container.appendChild(svg);
  }

  function drawTrend(container, summary, keys = ["kartunal", "minimalis"]) {
    container = el(container);
    if (!container) return;
    clear(container);
    const rows = summary.yearly_illustration;
    const width = 760;
    const height = 430;
    const margin = { top: 30, right: 80, bottom: 48, left: 52 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const maxY = Math.ceil(Math.max(...rows.flatMap(r => keys.map(k => r[k] || 0))) / 5) * 5;
    const x = year => margin.left + (year - rows[0].year) / (rows[rows.length - 1].year - rows[0].year) * plotW;
    const y = value => margin.top + plotH - value / maxY * plotH;
    const svg = svgEl("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": "Tren gaya ilustrasi per tahun" });

    for (let tick = 0; tick <= maxY; tick += 10) {
      const yy = y(tick);
      svg.appendChild(svgEl("line", { x1: margin.left, y1: yy, x2: width - margin.right, y2: yy, stroke: "currentColor", "stroke-opacity": "0.12" }));
      const label = svgEl("text", { x: margin.left - 8, y: yy + 4, "text-anchor": "end", fill: "currentColor", "fill-opacity": "0.55", "font-size": "10" });
      label.textContent = `${tick}%`;
      svg.appendChild(label);
    }
    rows.filter((_, i) => i % 5 === 0 || i === rows.length - 1).forEach(r => {
      const label = svgEl("text", { x: x(r.year), y: height - 17, "text-anchor": "middle", fill: "currentColor", "fill-opacity": "0.55", "font-size": "10" });
      label.textContent = r.year;
      svg.appendChild(label);
    });

    keys.forEach((key, keyIndex) => {
      const points = rows.map(r => `${x(r.year)},${y(r[key] || 0)}`).join(" ");
      const line = svgEl("polyline", { points, fill: "none", stroke: IL_COLORS[key], "stroke-width": "3", "stroke-linejoin": "round", "stroke-linecap": "round" });
      svg.appendChild(line);
      rows.forEach(r => {
        const dot = svgEl("circle", { cx: x(r.year), cy: y(r[key] || 0), r: "3", fill: IL_COLORS[key], opacity: "0.82" });
        dot.addEventListener("mousemove", event => showTooltip(event, `<b>${summary.labels.illustrations[key]}</b><br>${r.year}: ${fmt(r[key] || 0)}% dari ${fmtInt(r.n)} sampul`));
        dot.addEventListener("mouseleave", hideTooltip);
        svg.appendChild(dot);
      });
      const last = rows[rows.length - 1];
      const label = svgEl("text", { x: x(last.year) + 9, y: y(last[key] || 0) + 4 + keyIndex * 2, fill: IL_COLORS[key], "font-size": "11", "font-weight": "700" });
      label.textContent = summary.labels.illustrations[key];
      svg.appendChild(label);
    });
    container.appendChild(svg);
  }

  function renderFonts(container, fonts) {
    container = el(container);
    if (!container) return;
    clear(container);
    const list = document.createElement("div");
    list.className = "font-list";
    fonts.forEach(item => {
      const token = document.createElement("span");
      token.className = "font-token";
      token.textContent = `${item.font} ${fmt(item.pct)}%`;
      list.appendChild(token);
    });
    container.appendChild(list);
  }

  window.KartografiCharts = {
    COLORS, TF_COLORS, IL_COLORS,
    drawGenreChart, drawHeatmap, drawStackedBar, drawHorizontalDistribution, drawTrend, renderFonts,
    fmt, fmtInt, setCaption
  };
})();
