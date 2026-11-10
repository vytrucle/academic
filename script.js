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
}

function showHashTarget(hash, updateHash = false) {
  const targetId = hash || "about";
  const directSection = document.querySelector(`[data-section="${targetId}"]`);
  const anchor = document.getElementById(targetId);
  const parentSection = anchor?.closest("[data-section]");
  const pageId = directSection ? targetId : parentSection?.dataset.section || "about";

  showPage(pageId, updateHash);

  if (!directSection && anchor) {
    window.setTimeout(() => anchor.scrollIntoView({ behavior: "smooth", block: "start" }), 180);
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

window.addEventListener("popstate", () => {
  showHashTarget(window.location.hash.replace("#", ""), false);
});

const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

showHashTarget(window.location.hash.replace("#", ""), false);








