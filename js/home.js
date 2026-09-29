(() => {
  document.getElementById("site-header").innerHTML = Components.header("home");

  const grid = document.getElementById("school-grid");
  const status = document.getElementById("list-status");
  const citySel = document.getElementById("filter-city");
  const typeSel = document.getElementById("filter-type");
  const groupSel = document.getElementById("filter-group");
  let schools = [];

  function fillGroups() {
    const set = new Set();
    schools.forEach((u) => (u.majorGroups || []).forEach((g) => set.add(g)));
    groupSel.innerHTML = `<option value="">Tất cả nhóm ngành</option>` +
      [...set].sort().map((g) => `<option value="${Utils.escapeHtml(g)}">${Utils.escapeHtml(g)}</option>`).join("");
  }

  function filtered() {
    const city = citySel.value;
    const type = typeSel.value;
    const group = groupSel.value;
    return schools.filter((u) => {
      if (city && u.city !== city) return false;
      if (type && u.type !== type) return false;
      if (group && !(u.majorGroups || []).includes(group)) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    if (!list.length) {
      grid.innerHTML = "";
      status.innerHTML = Components.emptyState(
        "Không có trường phù hợp",
        "Thử đổi thành phố, loại hình hoặc nhóm ngành."
      );
      return;
    }
    status.innerHTML = `<p class="text-sm text-slate-500">${list.length} trường</p>`;
    grid.innerHTML = list.map((u) => Components.schoolCard(u)).join("");
  }

  async function load() {
    grid.innerHTML = Components.skeletonCards(3);
    status.innerHTML = "";
    try {
      const data = await Api.getUniversities();
      schools = data.universities || [];
      fillGroups();
      render();
      Search.bind(
        document.getElementById("search-input"),
        document.getElementById("search-list"),
        () => schools
      );
    } catch {
      grid.innerHTML = "";
      status.innerHTML = Components.errorState("Không tải được danh sách trường.");
      status.querySelector("[data-retry]")?.addEventListener("click", load);
    }
  }

  citySel.addEventListener("change", render);
  typeSel.addEventListener("change", render);
  groupSel.addEventListener("change", render);
  load();
})();
