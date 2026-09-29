const Search = {
  bind(input, listEl, getSchools) {
    let items = [];
    let active = -1;

    const close = () => {
      listEl.classList.add("hidden");
      listEl.innerHTML = "";
      active = -1;
    };

    const open = (html) => {
      listEl.innerHTML = html;
      listEl.classList.toggle("hidden", !html);
    };

    const filter = (q) => {
      const needle = Utils.removeDiacritics(q.trim());
      if (!needle) return [];
      return getSchools().filter((u) => {
        const hay = [u.name, u.code, ...(u.aliases || [])]
          .map((s) => Utils.removeDiacritics(s))
          .join(" ");
        return hay.includes(needle);
      }).slice(0, 8);
    };

    const render = () => {
      if (!items.length) {
        open(`<li class="px-3 py-2 text-sm text-slate-500">Không có kết quả</li>`);
        return;
      }
      open(items.map((u, i) => Components.searchItem(u, i === active)).join(""));
    };

    const go = (u) => {
      if (!u) return;
      window.location.href = "school.html?code=" + encodeURIComponent(u.code);
    };

    const runFilter = () => {
      const q = input.value;
      if (!q.trim()) {
        close();
        return;
      }
      items = filter(q);
      active = items.length ? 0 : -1;
      render();
    };
    const onType = Utils.debounce(runFilter, 200);

    input.addEventListener("input", onType);
    input.addEventListener("keydown", (e) => {
      if (listEl.classList.contains("hidden") && e.key !== "Escape") {
        if (e.key === "ArrowDown" && input.value.trim()) runFilter();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!items.length) return;
        active = (active + 1) % items.length;
        render();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!items.length) return;
        active = (active - 1 + items.length) % items.length;
        render();
      } else if (e.key === "Enter") {
        if (active >= 0 && items[active]) {
          e.preventDefault();
          go(items[active]);
        }
      } else if (e.key === "Escape") {
        close();
        input.blur();
      }
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#search-wrap")) close();
    });
  }
};
