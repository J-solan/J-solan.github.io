const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const projectGrid = document.querySelector("[data-project-grid]");
const emptyState = document.querySelector("[data-empty-state]");
const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));

const linkLabels = {
  repo: "Repositorio",
  demo: "Demo",
  local: "Ver práctica",
  doc: "Documentación",
  pdf: "PDF",
  paper: "Memoria",
  pathtracer: "Path Tracer",
  photonmapping: "Photon Mapper"
};

let projects = [];
let activeFilter = "Todos";

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

function getFallbackProjects() {
  const fallback = document.getElementById("project-data");

  if (!fallback) {
    return [];
  }

  try {
    return JSON.parse(fallback.textContent);
  } catch (error) {
    console.warn("No se pudo leer el respaldo de proyectos.", error);
    return [];
  }
}

async function loadProjects() {
  try {
    const response = await fetch("data/projects.json");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Usando proyectos embebidos para previsualizacion local.", error);
    return getFallbackProjects();
  }
}

function createProjectCard(project) {
  const article = document.createElement("article");
  article.className = "project-card";

  const links = Object.entries(project.links || {})
    .filter(([, href]) => Boolean(href))
    .map(([type, href]) => `<a href="${href}">${linkLabels[type] || type}</a>`)
    .join("");

  const technologies = (project.technologies || [])
    .map((tech) => `<span>${tech}</span>`)
    .join("");
  const subject = project.subject ? `<span>${project.subject}</span>` : "";

  article.innerHTML = `
    <div class="project-meta">
      <span>${project.category}</span>
      ${subject}
      <span>${project.year}</span>
      <span>${project.status}</span>
    </div>
    <h3>${project.title}</h3>
    <p>${project.description}</p>
    <div class="tech-list">${technologies}</div>
    <div class="project-links">${links}</div>
  `;

  return article;
}

function showEggPanel() {
  const panel = document.querySelector("[data-egg-panel]");

  if (!panel) {
    return;
  }

  panel.hidden = false;
  panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function filterProjects(category) {
  activeFilter = category;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === category);
  });

  const visibleProjects = projects
    .filter((project) => category === "Todos" || project.category === category)
    .sort((a, b) => Number(b.featured) - Number(a.featured));

  projectGrid.replaceChildren(...visibleProjects.map(createProjectCard));
  emptyState.hidden = visibleProjects.length > 0;
}

function scrollToInitialHash() {
  if (!window.location.hash) {
    return;
  }

  const target = document.querySelector(window.location.hash);

  if (target) {
    window.scrollTo({
      top: Math.max(target.getBoundingClientRect().top + window.scrollY - 82, 0),
      left: 0,
      behavior: "instant"
    });
  }
}

setTheme(getPreferredTheme());

document.querySelectorAll("[data-egg-trigger]").forEach((trigger) => {
  trigger.addEventListener("click", showEggPanel);
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
}

const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.getElementById("nav-menu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      navMenu.classList.remove("is-open");
    });
  });
}

if (projectGrid && filterButtons.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => filterProjects(button.dataset.filter));
  });

  loadProjects().then((loadedProjects) => {
    projects = Array.isArray(loadedProjects) ? loadedProjects : [];
    filterProjects(activeFilter);
    scrollToInitialHash();
  });
} else {
  scrollToInitialHash();
}
