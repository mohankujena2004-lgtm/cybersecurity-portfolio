// countries.js
// Populates a <select id="countryCode"> with country names, flag emoji and calling codes.
// Uses REST Countries API, with a fallback list if offline or API fails.

async function fetchCountryData() {
  const url = "https://restcountries.com/v3.1/all?fields=name,idd,cca2";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error("API response not OK");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Country API failed, using fallback list.", err);
    return null;
  }
}

// Convert country ISO code to flag emoji (e.g. "IN" -> 🇮🇳)
function countryCodeToFlag(isoCode) {
  if (!isoCode || isoCode.length !== 2) return "";
  const A = 0x1F1E6 - "A".charCodeAt(0);
  return String.fromCodePoint(
    A + isoCode.toUpperCase().charCodeAt(0),
    A + isoCode.toUpperCase().charCodeAt(1)
  );
}

function buildOptionsFromApiData(apiData) {
  const items = [];
  for (const country of apiData) {
    // idd example: { root: "+91", suffixes: [""] } or { root: "+1", suffixes: ["340","787"] }
    if (!country.idd || !country.idd.root) continue;
    const root = country.idd.root;
    const suffixes = Array.isArray(country.idd.suffixes) && country.idd.suffixes.length
      ? country.idd.suffixes
      : [""];
    const iso = country.cca2 || "";
    const name = country.name && (country.name.common || country.name.official) ? (country.name.common || country.name.official) : "Unknown";
    // expand suffixes to full codes (avoid duplicates)
    const codesSet = new Set();
    for (const s of suffixes) {
      const code = (root + (s || "")).replace(/\s+/g, "");
      codesSet.add(code);
    }
    for (const code of codesSet) {
      items.push({
        name,
        iso,
        code
      });
    }
  }
  // sort by name
  items.sort((a,b) => a.name.localeCompare(b.name));
  // unique by code+name
  const unique = [];
  const seen = new Set();
  for (const it of items) {
    const key = `${it.code}|${it.name}`;
    if (!seen.has(key)) {
      unique.push(it);
      seen.add(key);
    }
  }
  return unique;
}

// Minimal fallback list (common countries) — used when API fails
function fallbackCountryList() {
  return [
    { name: "India", iso: "IN", code: "+91" },
    { name: "United States", iso: "US", code: "+1" },
    { name: "United Kingdom", iso: "GB", code: "+44" },
    { name: "Australia", iso: "AU", code: "+61" },
    { name: "Japan", iso: "JP", code: "+81" },
    { name: "Germany", iso: "DE", code: "+49" },
    { name: "UAE", iso: "AE", code: "+971" }
  ];
}

async function populateCountrySelect(selectId = "countryCode", prefer = "+91") {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = ""; // clear existing

  let apiData = await fetchCountryData();
  let items;
  if (apiData && Array.isArray(apiData) && apiData.length) {
    items = buildOptionsFromApiData(apiData);
  } else {
    items = fallbackCountryList();
  }

  // Put preferred code at top if found
  const preferredIndex = items.findIndex(it => it.code === prefer);
  if (preferredIndex > 0) {
    const [p] = items.splice(preferredIndex, 1);
    items.unshift(p);
  }

  // Create option elements
  for (const item of items) {
    const flag = countryCodeToFlag(item.iso);
    const option = document.createElement("option");
    option.value = item.code;
    option.textContent = `${flag} ${item.name} (${item.code})`;
    sel.appendChild(option);
  }

  // Add a last option for "Other" to let user enter country code manually (optional)
  const other = document.createElement("option");
  other.value = "other";
  other.textContent = "🌐 Other (enter manually)";
  sel.appendChild(other);

  // if user picks "other", show a small manual input (if you want)
  sel.addEventListener("change", (e) => {
    const otherInputId = selectId + "_manual";
    let otherInput = document.getElementById(otherInputId);
    if (e.target.value === "other") {
      if (!otherInput) {
        otherInput = document.createElement("input");
        otherInput.id = otherInputId;
        otherInput.placeholder = "Enter country code (e.g. +254)";
        otherInput.name = selectId; // ensure it posts as same field if needed
        otherInput.style.marginTop = "8px";
        otherInput.style.width = "100%";
        otherInput.style.padding = "10px";
        const parent = sel.parentNode;
        parent.appendChild(otherInput);
      }
    } else {
      if (otherInput) otherInput.remove();
    }
  });
}

// auto-run on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  populateCountrySelect("countryCode", "+91"); // default prefer +91 (change if you want)
});
