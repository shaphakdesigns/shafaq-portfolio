/**
 * Dynamic portfolio folder gallery for Shafaq's portfolio.
 * Loads project data from assets/data/portfolio-data.json
 */
(function () {
  "use strict";

  const DATA_URL = "assets/data/portfolio-data.json";
  const grid = document.getElementById("portfolio-grid");
  const modal = document.getElementById("portfolio-gallery-modal");

  if (!grid || !modal) return;

  const modalTitle = modal.querySelector(".portfolio-gallery-title");
  const modalCount = modal.querySelector(".portfolio-gallery-count");
  const modalGrid = modal.querySelector(".portfolio-gallery-grid");
  const closeBtn = modal.querySelector(".portfolio-gallery-close");
  const backdrop = modal.querySelector(".portfolio-gallery-backdrop");

  let projects = [];
  let galleryLightbox = null;
  let activeProject = null;

  function encodePath(path) {
    return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
  }

  function renderCards() {
    grid.innerHTML = projects.map((project, index) => `
      <div class="col-xl-3 col-lg-4 col-md-6 portfolio-item" data-aos="fade-up" data-aos-delay="${100 + (index % 4) * 50}">
        <article class="portfolio-entry portfolio-folder-card">
          <figure class="entry-image">
            <img src="${encodePath(project.cover)}" alt="${project.name} cover" class="img-fluid" loading="lazy">
            <div class="entry-overlay portfolio-folder-overlay">
              <div class="overlay-content">
                <div class="entry-meta">${project.count} Images</div>
                <h3 class="entry-title">${project.name}</h3>
                <button type="button" class="btn btn-primary portfolio-view-gallery" data-project-id="${project.id}">
                  View Gallery
                </button>
              </div>
            </div>
          </figure>
        </article>
      </div>
    `).join("");

    grid.querySelectorAll(".portfolio-view-gallery").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openGallery(button.dataset.projectId);
      });
    });

    grid.querySelectorAll(".portfolio-folder-card").forEach((card) => {
      card.addEventListener("click", () => {
        const button = card.querySelector(".portfolio-view-gallery");
        if (button) openGallery(button.dataset.projectId);
      });
    });

    if (typeof AOS !== "undefined") {
      AOS.refresh();
    }
  }

  function buildGalleryItems(project) {
    return project.images.map((image, index) => {
      const safePath = encodePath(image);
      const fileName = image.split("/").pop();
      return `
        <div class="portfolio-gallery-item" data-aos="zoom-in" data-aos-delay="${Math.min(index * 30, 300)}">
          <a href="${safePath}" class="portfolio-gallery-link glightbox-dynamic" data-gallery="project-${project.id}" data-glightbox="title: ${project.name}; description: ${fileName}">
            <img src="${safePath}" alt="${project.name} - ${fileName}" loading="lazy">
          </a>
        </div>
      `;
    }).join("");
  }

  function destroyLightbox() {
    if (galleryLightbox) {
      galleryLightbox.destroy();
      galleryLightbox = null;
    }
  }

  function initLightbox() {
    destroyLightbox();
    galleryLightbox = GLightbox({
      selector: ".glightbox-dynamic",
      touchNavigation: true,
      loop: true,
      closeButton: true,
      zoomable: true
    });
  }

  function openGallery(projectId) {
    activeProject = projects.find((project) => project.id === projectId);
    if (!activeProject) return;

    modalTitle.textContent = activeProject.name;
    modalCount.textContent = `${activeProject.count} Images`;
    modalGrid.innerHTML = buildGalleryItems(activeProject);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("portfolio-modal-open");

    initLightbox();

    if (typeof AOS !== "undefined") {
      AOS.refreshHard();
    }
  }

  function closeGallery() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("portfolio-modal-open");
    destroyLightbox();
    modalGrid.innerHTML = "";
    activeProject = null;
  }

  closeBtn.addEventListener("click", closeGallery);
  backdrop.addEventListener("click", closeGallery);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeGallery();
    }
  });

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Unable to load portfolio data.");
      return response.json();
    })
    .then((data) => {
      projects = data.projects || [];
      renderCards();
    })
    .catch((error) => {
      grid.innerHTML = `<div class="col-12"><p class="text-center text-muted">${error.message}</p></div>`;
    });
})();
