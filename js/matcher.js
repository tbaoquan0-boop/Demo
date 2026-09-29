const MAX_GAP = 1.5;

const MatcherEngine = {
  MAX_GAP,

  classify(score, scores) {
    const years = Utils.latestYears(scores);
    if (!years.length) return null;
    const latestYear = years[0];
    const A = Number(scores[latestYear]);
    const delta = score - A;
    if (years.length === 1) {
      return { group: "singleYear", latestYear, A, B: null, delta };
    }
    const B = Number(scores[years[1]]);
    const hi = Math.max(A, B);
    const lo = Math.min(A, B);
    if (score >= hi) return { group: "both", latestYear, A, B, delta };
    if (score >= lo) return { group: "one", latestYear, A, B, delta };
    if (A - score <= MAX_GAP) return { group: "none", latestYear, A, B, delta };
    return null;
  },

  match(rows, { combo, score, cities, group }) {
    const list = [];
    rows.forEach((row) => {
      if (row.combo !== combo) return;
      if (cities.length && !cities.includes(row.city)) return;
      if (group && row.group !== group) return;
      const info = MatcherEngine.classify(score, row.scores);
      if (!info) return;
      list.push({
        ...row,
        ...info,
        yearLabels: Utils.latestYears(row.scores).slice(0, 2)
      });
    });
    const order = { both: 0, one: 1, none: 2, singleYear: 3 };
    list.sort((a, b) => {
      if (order[a.group] !== order[b.group]) return order[a.group] - order[b.group];
      return Math.abs(a.delta) - Math.abs(b.delta);
    });
    return list;
  },

  selfTest() {
    const cases = [
      { name: "bằng điểm chuẩn", scores: { 2025: 27, 2024: 26 }, score: 27, group: "both" },
      { name: "giữa hai năm", scores: { 2025: 27, 2024: 26 }, score: 26.5, group: "one" },
      { name: "dưới cả hai trong MAX_GAP", scores: { 2025: 27, 2024: 26 }, score: 25.6, group: "none" },
      { name: "ngoài MAX_GAP", scores: { 2025: 27, 2024: 26 }, score: 25, group: null },
      { name: "chỉ 1 năm", scores: { 2025: 26.5 }, score: 26, group: "singleYear" },
      { name: "điểm 0", scores: { 2025: 1, 2024: 0.5 }, score: 0, group: "none" },
      { name: "điểm 30", scores: { 2025: 27, 2024: 26 }, score: 30, group: "both" }
    ];
    return cases.map((c) => {
      const got = MatcherEngine.classify(c.score, c.scores);
      const group = got ? got.group : null;
      return { name: c.name, ok: group === c.group, expected: c.group, got: group };
    });
  }
};

(() => {
  document.getElementById("site-header").innerHTML = Components.header("matcher");

  const form = document.getElementById("matcher-form");
  const scoreInput = document.getElementById("score-input");
  const comboSel = document.getElementById("combo-input");
  const groupSel = document.getElementById("group-input");
  const errBox = document.getElementById("form-error");
  const results = document.getElementById("results");
  const PAGE = 5;
  let payload = null;
  const shown = { both: PAGE, one: PAGE, none: PAGE, singleYear: PAGE };

  const GROUP_META = {
    both: { title: "Đạt cả 2 năm", box: "border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30" },
    one: { title: "Đạt 1 trong 2 năm", box: "border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30" },
    none: { title: "Chưa đạt cả 2 năm (thiếu ≤ " + MAX_GAP + " so với năm gần nhất)", box: "border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30" },
    singleYear: { title: "Chỉ có 1 năm dữ liệu", box: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50" }
  };

  function setError(msg) {
    errBox.textContent = msg || "";
    errBox.classList.toggle("hidden", !msg);
  }

  function fillCombos(rows) {
    const combos = [...new Set(rows.map((r) => r.combo))].sort();
    comboSel.innerHTML = combos.map((c) => `<option value="${Utils.escapeHtml(c)}">${Utils.escapeHtml(c)}</option>`).join("");
    const groups = [...new Set(rows.map((r) => r.group).filter(Boolean))].sort();
    groupSel.innerHTML = `<option value="">Tất cả nhóm ngành</option>` +
      groups.map((g) => `<option value="${Utils.escapeHtml(g)}">${Utils.escapeHtml(g)}</option>`).join("");
  }

  function selectedCities() {
    const v = document.getElementById("city-input").value;
    if (v === "HN") return ["HN"];
    if (v === "HCM") return ["HCM"];
    return ["HN", "HCM"];
  }

  function renderGroup(key, items) {
    const meta = GROUP_META[key];
    const n = shown[key];
    const slice = items.slice(0, n);
    const more = items.length > n
      ? `<button type="button" data-more="${key}" class="mt-3 text-sm text-blue-600 dark:text-blue-400">Xem thêm (${items.length - n})</button>`
      : "";
    return `
      <section class="rounded-2xl border p-4 ${meta.box}">
        <h2 class="font-semibold text-slate-900 dark:text-white mb-3">${meta.title} (${items.length})</h2>
        <div class="grid gap-3">${slice.map((it) => Components.matcherCard(it)).join("")}</div>
        ${more}
      </section>`;
  }

  function draw(list, schoolCount, combo) {
    shown.both = PAGE;
    shown.one = PAGE;
    shown.none = PAGE;
    shown.singleYear = PAGE;
    paint(list, schoolCount, combo);
  }

  function paint(list, schoolCount, combo) {
    const banners = `
      <div class="rounded-2xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-4 text-sm text-slate-700 dark:text-slate-200 space-y-1">
        <p>Chỉ gợi ý trong các trường đã có dữ liệu (${schoolCount} trường).</p>
        <p>Điểm chuẩn các năm trước chỉ để tham khảo, không phải dự đoán.</p>
        <p>Chỉ áp dụng cho xét điểm thi tốt nghiệp THPT, thang 30. MAX_GAP = ${MAX_GAP} là giới hạn hiển thị, không phải ngưỡng đỗ.</p>
      </div>`;
    if (!list.length) {
      results.innerHTML = banners + Components.emptyState(
        "Không có ngành phù hợp",
        "Thử đổi tổ hợp, thành phố hoặc nhóm ngành."
      );
      return;
    }
    const grouped = { both: [], one: [], none: [], singleYear: [] };
    list.forEach((it) => grouped[it.group].push(it));
    results.dataset.combo = combo;
    results._list = list;
    results._schoolCount = schoolCount;
    results.innerHTML = banners + ["both", "one", "none", "singleYear"]
      .filter((k) => grouped[k].length)
      .map((k) => renderGroup(k, grouped[k]))
      .join("");
  }

  results.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-more]");
    if (!btn || !results._list) return;
    const key = btn.getAttribute("data-more");
    shown[key] += PAGE;
    paint(results._list, results._schoolCount, results.dataset.combo);
  });

  function runSelfTest() {
    if (Utils.getQueryParam("selftest") !== "1") return;
    const box = document.getElementById("selftest");
    const rows = MatcherEngine.selfTest();
    box.classList.remove("hidden");
    box.innerHTML = `<h2 class="font-semibold mb-2">Bộ test Matcher</h2>` +
      rows.map((r) => `<p class="${r.ok ? "text-emerald-600" : "text-rose-600"}">${r.ok ? "Đúng" : "Sai"} — ${Utils.escapeHtml(r.name)} (kỳ vọng ${r.expected}, ra ${r.got})</p>`).join("");
  }

  async function load() {
    results.innerHTML = Components.skeletonCards(3);
    try {
      payload = await Api.getMatcherData();
      fillCombos(payload.rows || []);
      results.innerHTML = Components.emptyState("Chưa phân tích", "Nhập điểm rồi bấm Phân tích.");
      runSelfTest();
    } catch {
      results.innerHTML = Components.errorState("Không tải được dữ liệu Matcher.");
      results.querySelector("[data-retry]")?.addEventListener("click", load);
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!payload) return;
    const raw = scoreInput.value.trim();
    const score = Number(raw.replace(",", "."));
    if (raw === "" || Number.isNaN(score) || score < 0 || score > 30) {
      setError("Nhập tổng điểm từ 0 đến 30 (chưa cộng ưu tiên).");
      return;
    }
    setError("");
    const combo = comboSel.value;
    const hasCombo = (payload.rows || []).some((r) => r.combo === combo);
    if (!hasCombo) {
      results.innerHTML = Components.emptyState("Chưa có dữ liệu cho tổ hợp này", "Chọn tổ hợp khác trong danh sách.");
      return;
    }
    const list = MatcherEngine.match(payload.rows || [], {
      combo,
      score,
      cities: selectedCities(),
      group: groupSel.value
    });
    draw(list, payload.schoolCount || 0, combo);
  });

  load();
})();
