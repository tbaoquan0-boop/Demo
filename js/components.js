const Components = {
  header(active) {
    const item = (href, key, label) => {
      const on = active === key
        ? "text-white bg-blue-600"
        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      return `<a href="${href}" class="px-3 py-1.5 rounded-lg text-sm font-medium ${on}">${label}</a>`;
    };
    return `
      <header class="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur">
        <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <a href="index.html" class="flex items-center gap-2 min-w-0">
            <img src="assets/logo.svg" alt="" class="w-8 h-8">
            <span class="font-semibold text-slate-900 dark:text-white truncate">UniReview VN</span>
          </a>
          <nav class="flex items-center gap-1">
            ${item("index.html", "home", "Trang chủ")}
            ${item("matcher.html", "matcher", "Gợi ý nguyện vọng")}
          </nav>
          <button id="theme-toggle" type="button" class="px-3 py-1.5 rounded-lg text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
            Sáng / Tối
          </button>
        </div>
      </header>`;
  },

  schoolCard(u) {
    const code = Utils.escapeHtml(u.code);
    const name = Utils.escapeHtml(u.name);
    const city = Utils.escapeHtml(Utils.cityLabel(u.city));
    const type = Utils.escapeHtml(Utils.typeLabel(u.type));
    const cover = Utils.escapeHtml(Utils.coverSrc(u.cover));
    const groups = (u.majorGroups || []).map((g) => Utils.escapeHtml(g)).join(" · ");
    const range =
      u.minScore != null && u.maxScore != null
        ? `${Utils.escapeHtml(String(u.minScore))} – ${Utils.escapeHtml(String(u.maxScore))}`
        : "Chưa cập nhật";
    const dataBadge = u.hasMajorData
      ? `<span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">Có điểm chuẩn</span>`
      : `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Chưa có điểm</span>`;
    return `
      <a href="school.html?code=${encodeURIComponent(u.code)}" class="block rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md fade-in">
        <img src="${cover}" alt="Cổng trường ${name}" class="w-full h-40 object-cover" onerror="this.onerror=null;this.src='assets/default-campus.svg'">
        <div class="p-4 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-semibold text-slate-900 dark:text-white">${name}</h3>
            <span class="text-xs font-mono text-slate-500">${code}</span>
          </div>
          <p class="text-sm text-slate-600 dark:text-slate-400">${city} · ${type}</p>
          <p class="text-sm text-slate-500">${groups || "Chưa cập nhật"}</p>
          <div class="flex items-center justify-between gap-2 pt-1">
            ${dataBadge}
            <span class="text-sm text-slate-700 dark:text-slate-300">Điểm: ${range}</span>
          </div>
        </div>
      </a>`;
  },

  searchItem(u, active) {
    const name = Utils.escapeHtml(u.name);
    const code = Utils.escapeHtml(u.code);
    const city = Utils.escapeHtml(Utils.cityLabel(u.city));
    const cover = Utils.escapeHtml(Utils.coverSrc(u.cover));
    const bg = active ? "bg-blue-50 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800";
    return `
      <li>
        <a href="school.html?code=${encodeURIComponent(u.code)}" data-search-item="${Utils.escapeHtml(u.code)}" class="flex items-center gap-3 px-3 py-2 ${bg}">
          <img src="${cover}" alt="" class="w-10 h-10 rounded-lg object-cover" onerror="this.onerror=null;this.src='assets/default-campus.svg'">
          <span class="min-w-0">
            <span class="block text-sm font-medium text-slate-900 dark:text-white truncate">${name}</span>
            <span class="block text-xs text-slate-500">${code} · ${city}</span>
          </span>
        </a>
      </li>`;
  },

  skeletonCards(count) {
    return Array.from({ length: count }, () => `
      <div class="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div class="skel h-40"></div>
        <div class="p-4 space-y-2">
          <div class="skel h-5 w-3/4"></div>
          <div class="skel h-4 w-1/2"></div>
          <div class="skel h-4 w-2/3"></div>
        </div>
      </div>`).join("");
  },

  skeletonTable(rows) {
    return Array.from({ length: rows }, () => `
      <tr>
        <td colspan="6" class="p-3"><div class="skel h-8 w-full"></div></td>
      </tr>`).join("");
  },

  emptyState(title, hint) {
    return `
      <div class="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <p class="font-medium text-slate-800 dark:text-slate-100">${Utils.escapeHtml(title)}</p>
        <p class="mt-1 text-sm text-slate-500">${Utils.escapeHtml(hint || "")}</p>
      </div>`;
  },

  errorState(message) {
    return `
      <div class="text-center py-12 px-4 rounded-2xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40">
        <p class="font-medium text-red-800 dark:text-red-200">${Utils.escapeHtml(message)}</p>
        <button type="button" data-retry class="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Thử lại</button>
      </div>`;
  },

  scoreRow(row) {
    const extra = [];
    if (row.scale && row.scale !== 30) extra.push("Thang " + row.scale);
    if (row.method && row.method !== "thpt") extra.push("Không phải THPT");
    if (row.note) extra.push(row.note);
    const badge = extra.length
      ? `<span class="text-xs text-amber-700 dark:text-amber-300">${Utils.escapeHtml(extra.join(" · "))}</span>`
      : "";
    const tuition =
      row.tuition != null
        ? `${Utils.formatMoney(row.tuition)}${row.tuitionYear ? " (" + Utils.escapeHtml(String(row.tuitionYear)) + ")" : ""}`
        : "Chưa cập nhật";
    const scores = (row.yearCols || [])
      .map((y) => `<td class="px-3 py-2 whitespace-nowrap">${row.scores && row.scores[y] != null ? Utils.escapeHtml(String(row.scores[y])) : "—"}</td>`)
      .join("");
    return `
      <tr class="border-t border-slate-200 dark:border-slate-800">
        <td class="px-3 py-2">${Utils.escapeHtml(row.name)}</td>
        <td class="px-3 py-2 font-mono text-sm">${Utils.escapeHtml(row.majorCode)}</td>
        <td class="px-3 py-2">${Utils.escapeHtml(row.combo)}</td>
        <td class="px-3 py-2 whitespace-nowrap">${tuition}</td>
        ${scores}
        <td class="px-3 py-2">${badge}</td>
      </tr>`;
  },

  matcherCard(item) {
    const years = item.yearLabels
      .map((y) => `<span class="text-sm">${Utils.escapeHtml(String(y))}: <strong>${item.scores[y] != null ? Utils.escapeHtml(String(item.scores[y])) : "—"}</strong></span>`)
      .join(" · ");
    const single = item.group === "singleYear"
      ? `<span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">Chỉ có 1 năm</span>`
      : "";
    return `
      <article class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-medium text-slate-900 dark:text-white">
            <a class="hover:text-blue-600" href="school.html?code=${encodeURIComponent(item.schoolCode)}">${Utils.escapeHtml(item.schoolName)}</a>
          </h3>
          ${single}
        </div>
        <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">${Utils.escapeHtml(item.majorName)} · ${Utils.escapeHtml(item.majorCode)} · ${Utils.escapeHtml(item.combo)}</p>
        <p class="mt-2 text-slate-700 dark:text-slate-200">${years}</p>
        <p class="mt-1 text-sm ${item.delta >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}">
          Chênh lệch năm ${Utils.escapeHtml(String(item.latestYear))}: ${Utils.formatDelta(item.delta)}
        </p>
      </article>`;
  }
};
