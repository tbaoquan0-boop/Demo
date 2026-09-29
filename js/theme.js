const Theme = {
  KEY: "unireview-theme",

  current() {
    return localStorage.getItem(Theme.KEY) || "dark";
  },

  apply(mode) {
    document.documentElement.classList.toggle("dark", mode === "dark");
  },

  toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    localStorage.setItem(Theme.KEY, next);
    Theme.apply(next);
  },

  init() {
    Theme.apply(Theme.current());
    document.addEventListener("click", (e) => {
      if (e.target.closest("#theme-toggle")) Theme.toggle();
    });
  }
};

Theme.init();
