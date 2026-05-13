const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const pageLinks = document.querySelectorAll("[data-page]");
const sections = document.querySelectorAll("[data-section]");
const publicationFilterButtons = document.querySelectorAll("[data-filter-group]");
const blogFilterButtons = document.querySelectorAll("[data-blog-filter-group]");
const publicationItems = document.querySelectorAll(".publication-item");
const publicationYearGroups = document.querySelectorAll("[data-year-group]");
const blogItems = document.querySelectorAll(".blog-item");
const themeToggle = document.querySelector(".theme-toggle");
const siteSearch = document.querySelector("#site-search");
let footprintMap;
let footprintTileLayer;

const mapTiles = {
  light: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const publicationFilters = {
  type: "all",
  year: "all",
  role: "all",
};

const blogFilters = {
  source: "all",
  topic: "all",
};

function showPage(pageId, updateHash = true) {
  sections.forEach((section) => {
    section.classList.toggle("active-section", section.dataset.section === pageId);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageId && link.classList.contains("brand") === false);
  });

  navLinks.classList.remove("open");
  navToggle?.setAttribute("aria-expanded", "false");

  if (updateHash) {
    history.pushState(null, "", `#${pageId}`);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "metrics") {
    window.setTimeout(initFootprintMap, 120);
  }
}

navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.page);
  });
});

publicationFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.filterGroup || "type";
    const filter = button.dataset.filter;
    publicationFilters[group] = filter;

    publicationFilterButtons.forEach((item) => {
      if ((item.dataset.filterGroup || "type") === group) {
        item.classList.remove("active");
      }
    });
    button.classList.add("active");

    publicationItems.forEach((item) => {
      const typeMatch = publicationFilters.type === "all" || item.dataset.type === publicationFilters.type;
      const yearMatch = publicationFilters.year === "all" || item.dataset.year === publicationFilters.year;
      const roleMatch = publicationFilters.role === "all" || item.dataset.role === publicationFilters.role;
      const shouldShow = typeMatch && yearMatch && roleMatch;
      item.classList.toggle("hidden", !shouldShow);
    });

    publicationYearGroups.forEach((group) => {
      const hasVisibleItems = group.querySelectorAll(".publication-item:not(.hidden)").length > 0;
      group.classList.toggle("hidden", !hasVisibleItems);
    });
  });
});

blogFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.dataset.blogFilterGroup || "source";
    const filter = button.dataset.blogFilter;
    blogFilters[group] = filter;

    blogFilterButtons.forEach((item) => {
      if ((item.dataset.blogFilterGroup || "source") === group) {
        item.classList.remove("active");
      }
    });
    button.classList.add("active");

    blogItems.forEach((item) => {
      const sourceMatch = blogFilters.source === "all" || item.dataset.source === blogFilters.source;
      const topicMatch = blogFilters.topic === "all" || item.dataset.topic === blogFilters.topic;
      item.classList.toggle("hidden", !(sourceMatch && topicMatch));
    });
  });
});

siteSearch?.addEventListener("input", () => {
  const query = siteSearch.value.trim().toLowerCase();
  if (!query) return;

  const matchingSection = Array.from(sections).find((section) =>
    section.textContent.toLowerCase().includes(query)
  );

  if (matchingSection) {
    showPage(matchingSection.dataset.section);
  }
});

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }
  updateMapTheme(theme);
}

themeToggle?.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme || "light";
  setTheme(currentTheme === "dark" ? "light" : "dark");
});

function initFootprintMap() {
  if (footprintMap || typeof L === "undefined") return;

  const places = [
    { name: "Ca Mau, Vietnam", coords: [9.1768, 105.1524], year: "Born and raised" },
    { name: "Vinh Long, Vietnam", coords: [10.2396, 105.9571], year: "Academic workshop" },
    { name: "Kien Giang, Vietnam", coords: [10.0125, 105.0809], year: "High school competitions" },
    { name: "Ho Chi Minh City, Vietnam", coords: [10.8231, 106.6297], year: "B.A. in Psychology, Ho Chi Minh City University of Education" },
    { name: "Can Tho, Vietnam", coords: [10.0452, 105.7469], year: "Travel and leisure" },
    { name: "Da Lat, Vietnam", coords: [11.9404, 108.4583], year: "Travel and leisure" },
    { name: "Pavia, Italy", coords: [45.1921, 9.1592], year: "Master's program in Psychology, Neuroscience, and Human Sciences" },
  ];

  footprintMap = L.map("footprint-map", {
    scrollWheelZoom: false,
    worldCopyJump: true,
  });

  const activeTheme = document.documentElement.dataset.theme || "light";
  footprintTileLayer = L.tileLayer(mapTiles[activeTheme].url, {
    maxZoom: 19,
    attribution: mapTiles[activeTheme].attribution,
  }).addTo(footprintMap);

  const markerGroup = L.featureGroup().addTo(footprintMap);
  places.forEach((place) => {
    L.marker(place.coords)
      .bindPopup(`<strong>${place.name}</strong><br>${place.year}`)
      .addTo(markerGroup);
  });

  L.polyline(
    places.map((place) => place.coords),
    { color: "#d20bb8", weight: 3, opacity: 0.75, dashArray: "8 8" }
  ).addTo(footprintMap);

  footprintMap.fitBounds(markerGroup.getBounds().pad(0.26));
  window.setTimeout(() => footprintMap.invalidateSize(), 150);
}

function updateMapTheme(theme) {
  if (!footprintMap || !footprintTileLayer) return;

  footprintMap.removeLayer(footprintTileLayer);
  footprintTileLayer = L.tileLayer(mapTiles[theme].url, {
    maxZoom: 19,
    attribution: mapTiles[theme].attribution,
  }).addTo(footprintMap);
}

window.addEventListener("popstate", () => {
  const pageId = window.location.hash.replace("#", "") || "about";
  showPage(pageId, false);
});

const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

const initialPage = window.location.hash.replace("#", "") || "about";
showPage(initialPage, false);
