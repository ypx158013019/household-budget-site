var Charts = (() => {
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
  const axisNumber = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
  const monthName = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const palette = ["#17675a", "#d6a04f", "#669483", "#af7754", "#c5755c", "#84945e", "#9d829e", "#6f909e", "#b9aa75"];

  function escapeText(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function barChart(months) {
    const left = 55;
    const right = 616;
    const top = 17;
    const bottom = 192;
    const column = (right - left) / (months.length || 1);
    const barWidth = Math.min(25, column / 3);
    const desiredStep = Math.max(4, ...months.flatMap(({ income, spending }) => [income, spending])) / 4;
    const power = 10 ** Math.floor(Math.log10(desiredStep));
    const step = [1, 2, 2.5, 5, 10].map((n) => n * power).find((n) => n >= desiredStep);
    const ticks = Array.from({ length: 5 }, (_, index) => {
      const y = bottom - ((bottom - top) * index) / 4;
      return `<line class="chart-gridline" x1="${left}" x2="${right}" y1="${y}" y2="${y}"/>
        <text class="chart-label" x="${left - 9}" y="${y}" dy=".34em" text-anchor="end">$${axisNumber.format(index * step).toLowerCase()}</text>`;
    }).join("");

    const labels = months.map(({ month }) => monthName.format(new Date(`${month}-01T00:00:00Z`)));
    const groups = months.map(({ income, spending }, index) => {
      const x = left + column * (index + 0.5);
      const bars = [income, spending].map((value, series) => {
        const height = (value / (step * 4)) * (bottom - top);
        const color = series === 0 ? "chart-income" : "chart-spending";
        const title = `${labels[index]} ${series === 0 ? "income" : "spending"} ${usd.format(value)}`;
        return `<rect class="${color}" x="${series === 0 ? x - barWidth - 3 : x + 3}" y="${bottom - height}"
          width="${barWidth}" height="${height}" rx="${Math.min(4, height / 2)}"><title>${title}</title></rect>`;
      }).join("");
      const current = index === months.length - 1 ? " chart-label-current" : "";
      return `${bars}<text class="chart-label${current}" x="${x}" y="216" text-anchor="middle">${labels[index]}</text>`;
    }).join("");
    const highlight = months.length ? `<rect class="chart-current" x="${right - column + 5}" y="5"
      width="${column - 10}" height="222" rx="10"/>` : "";
    const description = months.map(({ income, spending }, index) =>
      `${labels[index]} income ${usd.format(income)}, spending ${usd.format(spending)}.`).join(" ");

    return `<svg class="bar-chart" viewBox="0 0 626 230" role="img" aria-label="Monthly income and spending">
      <desc>${description || "No months to show."}</desc>${highlight}${ticks}${groups}
    </svg>`;
  }

  function donutChart(categories, { compact = false } = {}) {
    const slices = categories
      .map((entry, index) => ({ ...entry, color: palette[index % palette.length] }))
      .filter(({ spent }) => spent > 0)
      .sort((a, b) => b.spent - a.spent);
    const total = slices.reduce((cents, { spent }) => cents + Math.round(spent * 100), 0) / 100;
    const height = compact ? 242 + slices.length * 29 : Math.max(268, slices.length * 29 + 18);
    const width = compact ? 340 : 576;
    const cx = compact ? 170 : 120;
    const cy = compact ? 109 : height / 2;
    const ring = `cx="${cx}" cy="${cy}" r="83" fill="none" stroke-width="25"`;
    const nameX = compact ? 20 : 255;
    const legendY = compact ? 242 : (height - (slices.length - 1) * 29) / 2;
    let offset = 0;

    const arcs = slices.map(({ category, spent, color }) => {
      const share = (spent / total) * 100;
      const visible = slices.length === 1 ? 100 : share - Math.min(0.8, share / 4);
      const arc = `<circle ${ring} pathLength="100" stroke="${color}" stroke-dasharray="${visible} ${100 - visible}"
        stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})">
        <title>${escapeText(category)} ${usd.format(spent)}</title></circle>`;
      offset += share;
      return arc;
    }).join("");

    const legend = slices.map(({ category, spent, color }, index) => {
      const y = legendY + index * 29;
      return `<rect x="${nameX}" y="${y - 6}" width="12" height="12" rx="4" fill="${color}"/>
        <text class="donut-label" x="${nameX + 23}" y="${y}" dy=".34em">${escapeText(category)}</text>
        <text class="donut-value" x="${width - 14}" y="${y}" dy=".34em" text-anchor="end">${usd.format(spent)}</text>`;
    }).join("");
    const description = slices.map(({ category, spent }) => `${escapeText(category)} ${usd.format(spent)}.`).join(" ");

    return `<svg class="donut-chart donut-${compact ? "compact" : "wide"}" viewBox="0 0 ${width} ${height}"
      role="img" aria-label="Spending by category">
      <desc>${description || "No spending recorded this month."}</desc>
      <circle class="donut-track" ${ring}/>${arcs}
      <text class="donut-label" x="${cx}" y="${cy - 7}" text-anchor="middle">${slices.length ? "Total spending" : "No spending"}</text>
      <text class="donut-total" x="${cx}" y="${cy + 24}" text-anchor="middle">${usd.format(total)}</text>
      ${legend}
    </svg>`;
  }

  return Object.freeze({ barChart, donutChart });
})();
