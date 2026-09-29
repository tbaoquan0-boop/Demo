const Utils = {
  removeDiacritics(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  },

  escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  },

  debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  },

  formatScore(value) {
    if (value === null || value === undefined || value === "") return "Chưa cập nhật";
    return String(value);
  },

  formatDelta(delta) {
    const n = Number(delta);
    if (Number.isNaN(n)) return "";
    const abs = Math.abs(n).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    if (n > 0) return `+${abs}`;
    if (n < 0) return `−${abs}`;
    return "0";
  },

  formatMoney(value) {
    if (value === null || value === undefined || value === "") return "Chưa cập nhật";
    const n = Number(value);
    if (Number.isNaN(n)) return "Chưa cập nhật";
    return n.toLocaleString("vi-VN") + " đ";
  },

  cityLabel(city) {
    if (city === "HN") return "Hà Nội";
    if (city === "HCM") return "TP.HCM";
    return "Chưa cập nhật";
  },

  typeLabel(type) {
    if (type === "public") return "Công lập";
    if (type === "private") return "Tư thục";
    return "Chưa cập nhật";
  },

  isHttpUrl(url) {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  },

  isAssetPath(path) {
    return typeof path === "string" && path.startsWith("assets/") && !path.includes("..");
  },

  coverSrc(path) {
    return Utils.isAssetPath(path) ? path : "assets/default-campus.svg";
  },

  latestYears(scores) {
    return Object.keys(scores || {})
      .map(Number)
      .filter((y) => !Number.isNaN(y))
      .sort((a, b) => b - a);
  }
};
