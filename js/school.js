(() => {
  document.getElementById("site-header").innerHTML = Components.header("school");

  const root = document.getElementById("school-root");
  const code = (Utils.getQueryParam("code") || "").toUpperCase();

  function flattenMajors(payload) {
    const rows = [];
    (payload.majors || []).forEach((m) => {
      (m.combos || []).forEach((c) => {
        rows.push({
          name: m.name,
          majorCode: m.majorCode,
          group: m.group,
          combo: c.combo,
          scores: c.scores || {},
          scale: m.scale,
          method: m.method,
          note: m.note,
          tuition: m.tuition,
          tuitionYear: m.tuitionYear
        });
      });
    });
    return rows;
  }

  function yearCols(rows) {
    const set = new Set();
    rows.forEach((r) => Object.keys(r.scores || {}).forEach((y) => set.add(y)));
    return [...set].sort((a, b) => Number(b) - Number(a));
  }

  function renderInfo(uni) {
    const website = Utils.isHttpUrl(uni.website)
      ? `<a class="text-blue-600 dark:text-blue-400 underline" href="${Utils.escapeHtml(uni.website)}" rel="noopener noreferrer" target="_blank">${Utils.escapeHtml(uni.website)}</a>`
      : "Chưa cập nhật";
    const cover = Utils.escapeHtml(Utils.coverSrc(uni.cover));
    const name = Utils.escapeHtml(uni.name);
    return `
      <img src="${cover}" alt="Cổng trường ${name}" class="w-full h-52 sm:h-72 object-cover" onerror="this.onerror=null;this.src='assets/default-campus.svg'">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <p class="text-sm font-mono text-slate-500">${Utils.escapeHtml(uni.code)}</p>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">${name}</h1>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          ${Utils.escapeHtml(Utils.cityLabel(uni.city))} · ${Utils.escapeHtml(Utils.typeLabel(uni.type))}
        </p>
        <dl class="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
          <div><dt class="text-slate-500">Địa chỉ</dt><dd>${uni.address ? Utils.escapeHtml(uni.address) : "Chưa cập nhật"}</dd></div>
          <div><dt class="text-slate-500">Năm thành lập</dt><dd>${uni.founded ? Utils.escapeHtml(String(uni.founded)) : "Chưa cập nhật"}</dd></div>
          <div class="sm:col-span-2"><dt class="text-slate-500">Website</dt><dd>${website}</dd></div>
        </dl>
      </div>`;
  }

  function bindTable(rows, years) {
    const qInput = document.getElementById("score-q");
    const comboSel = document.getElementById("score-combo");
    const tbody = document.getElementById("score-body");
    let sortKey = years[0] || "name";
    let sortDir = "desc";

    const combos = [...new Set(rows.map((r) => r.combo))].sort();
    comboSel.innerHTML = `<option value="">Tất cả tổ hợp</option>` +
      combos.map((c) => `<option value="${Utils.escapeHtml(c)}">${Utils.escapeHtml(c)}</option>`).join("");

    function apply() {
      const q = Utils.removeDiacritics(qInput.value.trim());
      const combo = comboSel.value;
      let list = rows.filter((r) => {
        if (combo && r.combo !== combo) return false;
        if (q) {
          const hay = Utils.removeDiacritics([r.name, r.majorCode, r.combo].join(" "));
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      list.sort((a, b) => {
        let av;
        let bv;
        if (sortKey === "name") {
          av = a.name;
          bv = b.name;
        } else if (sortKey === "combo") {
          av = a.combo;
          bv = b.combo;
        } else {
          av = a.scores[sortKey];
          bv = b.scores[sortKey];
          if (av == null) av = sortDir === "asc" ? Infinity : -Infinity;
          if (bv == null) bv = sortDir === "asc" ? Infinity : -Infinity;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
      if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="${5 + years.length}" class="px-3 py-8 text-center text-slate-500">Không có ngành khớp bộ lọc</td></tr>`;
        return;
      }
      tbody.innerHTML = list.map((r) => Components.scoreRow({ ...r, yearCols: years })).join("");
    }

    document.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.getAttribute("data-sort");
        if (sortKey === key) sortDir = sortDir === "asc" ? "desc" : "asc";
        else {
          sortKey = key;
          sortDir = key === "name" || key === "combo" ? "asc" : "desc";
        }
        apply();
      });
    });
    qInput.addEventListener("input", Utils.debounce(apply, 200));
    comboSel.addEventListener("change", apply);
    apply();
  }

  function tableHtml(years) {
    const yearHeads = years
      .map((y) => `<th><button type="button" data-sort="${Utils.escapeHtml(y)}" class="font-semibold">Điểm ${Utils.escapeHtml(y)}</button></th>`)
      .join("");
    return `
      <div class="max-w-6xl mx-auto px-4 pb-12">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">Bảng điểm chuẩn</h2>
        <div class="flex flex-col sm:flex-row gap-2 mb-3">
          <input id="score-q" type="search" placeholder="Lọc tên ngành, mã, tổ hợp" class="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
          <select id="score-combo" class="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"></select>
        </div>
        <div class="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table class="min-w-[720px] w-full text-sm text-left">
            <thead class="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
              <tr>
                <th class="px-3 py-2"><button type="button" data-sort="name" class="font-semibold">Ngành</button></th>
                <th class="px-3 py-2">Mã</th>
                <th class="px-3 py-2"><button type="button" data-sort="combo" class="font-semibold">Tổ hợp</button></th>
                <th class="px-3 py-2">Học phí</th>
                ${yearHeads}
                <th class="px-3 py-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody id="score-body">${Components.skeletonTable(5)}</tbody>
          </table>
        </div>
      </div>`;
  }

  async function load() {
    if (!code) {
      root.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12">${Components.emptyState("Thiếu mã trường", "Quay lại trang chủ và chọn một trường.")}</div>`;
      return;
    }
    root.innerHTML = `<div class="skel h-52 sm:h-72 w-full rounded-none"></div><div class="max-w-6xl mx-auto px-4 py-6 space-y-3"><div class="skel h-8 w-2/3"></div><div class="skel h-4 w-1/3"></div></div>`;
    try {
      const data = await Api.getUniversities();
      const uni = (data.universities || []).find((u) => u.code === code);
      if (!uni) {
        root.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12">${Components.emptyState("Không tìm thấy trường", "Mã " + code + " không có trong dữ liệu.")}</div>`;
        return;
      }
      const majors = await Api.getMajors(code);
      if (majors.status === "no-data") {
        root.innerHTML = renderInfo(uni) + `<div class="max-w-6xl mx-auto px-4 pb-12">${Components.emptyState("Chưa cập nhật", "Trường này chưa có file điểm chuẩn.")}</div>`;
        return;
      }
      const rows = flattenMajors(majors);
      const years = yearCols(rows);
      root.innerHTML = renderInfo(uni) + tableHtml(years);
      bindTable(rows, years);
    } catch {
      root.innerHTML = `<div class="max-w-6xl mx-auto px-4 py-12">${Components.errorState("Không tải được thông tin trường.")}</div>`;
      root.querySelector("[data-retry]")?.addEventListener("click", load);
    }
  }

  load();
})();
