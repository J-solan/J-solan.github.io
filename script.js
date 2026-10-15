(function () {
  "use strict";

  const projects = Array.isArray(window.PROJECTS)
    ? [...window.PROJECTS].sort((a, b) => a.order - b.order)
    : [];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createProjectCard(project) {
    const article = element("article", "project-card");

    if (project.image) {
      const media = element("a", "project-card-media");
      media.href = project.route;
      media.tabIndex = -1;
      media.setAttribute("aria-hidden", "true");
      const image = element("img");
      image.src = project.image;
      image.alt = "";
      image.loading = "lazy";
      media.append(image);
      article.append(media);
    }

    const body = element("div", "project-card-body");
    const meta = element("div", "project-meta");
    if (project.category) meta.append(element("span", "", project.category));
    if (project.year) meta.append(element("span", "", String(project.year)));

    const title = element("h3");
    const titleLink = element("a", "", project.title);
    titleLink.href = project.route;
    title.append(titleLink);

    const summary = element("p", "", project.summary);
    const technologies = element("ul", "tech-list");
    technologies.setAttribute("aria-label", "Tecnologías");
    for (const technology of project.technologies || []) {
      technologies.append(element("li", "", technology));
    }

    const links = element("div", "project-card-links");
    const callToAction = element(
      "a",
      "project-cta",
      project.format === "Cuaderno HTML" ? "Abrir cuaderno" : "Ver proyecto"
    );
    callToAction.href = project.route;
    const arrow = element("span", "", "→");
    arrow.setAttribute("aria-hidden", "true");
    callToAction.append(" ", arrow);
    links.append(callToAction);

    if (project.demo) {
      const demoLink = element("a", "project-cta", "Demo en vivo");
      demoLink.href = project.demo;
      demoLink.target = "_blank";
      demoLink.rel = "noopener";
      const demoArrow = element("span", "", "↗");
      demoArrow.setAttribute("aria-hidden", "true");
      demoLink.append(" ", demoArrow);
      links.append(demoLink);
    }

    body.append(meta, title, summary, technologies, links);
    article.append(body);
    return article;
  }

  function createRepositoryRow(project) {
    const link = element("a", "repo-entry");
    link.href = project.route;

    const icon = element("span", "repo-entry-icon");
    icon.setAttribute("aria-hidden", "true");

    const copy = element("span", "repo-entry-copy");
    copy.append(
      element("strong", "repo-entry-title", project.title),
      element("span", "repo-entry-summary", project.summary)
    );

    const details = element("span", "repo-entry-details");
    details.append(
      element("span", "", String(project.year || "")),
      element("span", "", project.format || "Proyecto")
    );

    const arrow = element("span", "repo-entry-arrow", "→");
    arrow.setAttribute("aria-hidden", "true");
    link.append(icon, copy, details, arrow);
    return link;
  }

  for (const container of document.querySelectorAll("[data-project-list]")) {
    const mode = container.dataset.mode;
    const category = container.dataset.category;
    const subject = container.dataset.subject;
    const visible = projects.filter((project) => {
      if (mode === "featured") return Boolean(project.featured);
      if (subject && project.subject !== subject) return false;
      if (category) return project.category === category;
      return true;
    });
    if (mode === "featured") visible.sort((a, b) => a.featured - b.featured);

    const renderer = container.dataset.view === "repository"
      ? createRepositoryRow
      : createProjectCard;
    container.replaceChildren(...visible.map(renderer));

    const group = container.closest("[data-project-group]");
    if (group) {
      group.hidden = visible.length === 0;
      const count = group.querySelector("[data-project-count]");
      if (count) count.textContent = `${visible.length} ${visible.length === 1 ? "proyecto" : "proyectos"}`;
    }
  }

  const categoryOrder = ["Carrera", "Máster", "Personal"];
  const categoryPaths = {
    Carrera: "carrera",
    Máster: "master",
    Personal: "personal"
  };

  for (const container of document.querySelectorAll("[data-project-tree]")) {
    const list = element("ul", "directory-tree");
    for (const category of categoryOrder) {
      const count = projects.filter((project) => project.category === category).length;
      if (count === 0) continue;

      const item = element("li");
      const link = element("a");
      link.href = `/proyectos/#${categoryPaths[category]}`;
      const folder = element("span", "tree-folder");
      folder.setAttribute("aria-hidden", "true");
      link.append(
        folder,
        element("span", "tree-path", `${categoryPaths[category]}/`),
        element("span", "tree-count", String(count))
      );
      item.append(link);
      list.append(item);
    }
    container.replaceChildren(list);
  }

  for (const node of document.querySelectorAll("[data-total-count]")) node.textContent = projects.length;

  for (const container of document.querySelectorAll("[data-project-navigation]")) {
    const category = container.dataset.category;
    const subject = container.dataset.subject;
    const current = container.dataset.currentProject;
    const links = projects
      .filter((project) => project.category === category && (!subject || project.subject === subject))
      .map((project) => {
        const link = element("a", "project-browser-link");
        link.href = project.route;
        if (project.id === current) link.setAttribute("aria-current", "page");
        const folder = element("span", "tree-folder");
        folder.setAttribute("aria-hidden", "true");
        link.append(folder, element("span", "", `${project.id}/`));
        return link;
      });
    container.replaceChildren(...links);
  }

  const pathname = window.location.pathname;
  if (pathname.startsWith("/proyectos/") || pathname.startsWith("/projects/")) {
    document.querySelector("[data-nav-projects]")?.setAttribute("aria-current", "page");
  }
})();
