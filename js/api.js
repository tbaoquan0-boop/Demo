const Api = (() => {
  const DELAY_MS = 500;
  const cache = {};

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error("Không tải được dữ liệu");
      err.status = res.status;
      throw err;
    }
    return res.json();
  }

  async function delayed(key, loader) {
    if (cache[key]) return cache[key];
    await wait(DELAY_MS);
    const data = await loader();
    cache[key] = data;
    return data;
  }

  function getUniversities() {
    return delayed("universities", () => fetchJson("data/universities.json"));
  }

  async function getMajors(code) {
    const key = "majors:" + code;
    if (cache[key]) return cache[key];
    await wait(DELAY_MS);
    const res = await fetch("data/majors/" + encodeURIComponent(code) + ".json");
    if (res.status === 404) {
      const empty = { status: "no-data", code };
      cache[key] = empty;
      return empty;
    }
    if (!res.ok) {
      throw new Error("Không tải được điểm chuẩn");
    }
    const data = await res.json();
    cache[key] = data;
    return data;
  }

  function getMatcherData() {
    return delayed("matcher", () => fetchJson("data/matcher-data.json"));
  }

  return { getUniversities, getMajors, getMatcherData };
})();
