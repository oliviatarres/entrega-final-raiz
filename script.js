const brandImage = document.querySelector(".brand img");

if (brandImage) {
  brandImage.addEventListener("error", () => {
    brandImage.closest(".brand")?.classList.add("logo-missing");
  });
}

const heroGallery = document.querySelector(".hero-gallery");

if (heroGallery) {
  heroGallery.addEventListener("mouseover", (event) => {
    const piece = event.target.closest(".hero-piece");

    if (!piece || piece.classList.contains("is-revealed")) return;

    piece.classList.add("is-revealed");
  });

  heroGallery.addEventListener(
    "touchstart",
    (event) => {
      const piece = event.target.closest(".hero-piece");

      if (!piece || piece.classList.contains("is-revealed")) return;

      piece.classList.add("is-revealed");
    },
    { passive: true }
  );
}

const heroPieces = document.querySelectorAll(".hero-piece[data-original][data-aged]");

heroPieces.forEach((piece) => {
  const originalSrc = piece.dataset.original;
  const agedSrc = piece.dataset.aged;
  let swapTimer;

  [originalSrc, agedSrc].forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  const swapImage = (src) => {
    window.clearTimeout(swapTimer);
    piece.classList.add("is-fading");

    swapTimer = window.setTimeout(() => {
      piece.src = src;
      piece.classList.remove("is-fading");
    }, 120);
  };

  piece.addEventListener("mouseenter", () => swapImage(agedSrc));
  piece.addEventListener("mouseleave", () => swapImage(originalSrc));
});

/* PROYECTOS */
const projectStack = document.querySelector(".project-stack");
const projectDots = document.querySelector(".project-dots");

if (projectStack) {
  const projectCards = Array.from(projectStack.querySelectorAll(".project-card"));
  const mobileProjectsQuery = window.matchMedia("(max-width: 680px)");
  const projectDotButtons = projectDots
    ? projectCards.map((_, index) => {
        const dot = document.createElement("button");

        dot.className = "project-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Ver proyecto ${index + 1}`);
        projectDots.append(dot);

        return dot;
      })
    : [];
  let activeProjectIndex = 0;
  let projectTouchStartX = 0;
  let projectTouchStartY = 0;
  let projectTouchDeltaX = 0;
  let projectWheelLock = false;

  const getProjectCardSnapLeft = (card) => {
    const stackStyles = window.getComputedStyle(projectStack);
    const stackPaddingLeft = Number.parseFloat(stackStyles.paddingLeft) || 0;

    return card.offsetLeft - stackPaddingLeft;
  };

  const updateProjectDots = () => {
    projectDotButtons.forEach((dot, index) => {
      const isActive = index === activeProjectIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  };

  const scrollToProjectCard = (index) => {
    if (projectCards.length === 0) {
      return;
    }

    activeProjectIndex = Math.min(projectCards.length - 1, Math.max(0, index));
    updateProjectDots();

    projectStack.scrollTo({
      left: getProjectCardSnapLeft(projectCards[activeProjectIndex]),
      behavior: "smooth",
    });
  };

  const setProjectFlipped = (selectedCard) => {
    projectCards.forEach((card) => {
      const isSelected = card === selectedCard;
      const openButton = card.querySelector(".project-card__button");
      const backFace = card.querySelector(".project-card__face--back");

      card.classList.toggle("is-flipped", isSelected);
      openButton?.setAttribute("aria-expanded", isSelected ? "true" : "false");
      backFace?.setAttribute("aria-hidden", isSelected ? "false" : "true");
    });
  };

  projectDotButtons.forEach((dot, index) => {
    dot.addEventListener("click", () => scrollToProjectCard(index));
  });

  updateProjectDots();

  projectStack.addEventListener("touchstart", (event) => {
    if (!mobileProjectsQuery.matches) {
      return;
    }

    const touch = event.touches[0];

    projectTouchStartX = touch.clientX;
    projectTouchStartY = touch.clientY;
    projectTouchDeltaX = 0;
  }, { passive: true });

  projectStack.addEventListener("touchmove", (event) => {
    if (!mobileProjectsQuery.matches) {
      return;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - projectTouchStartX;
    const deltaY = touch.clientY - projectTouchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      event.preventDefault();
      projectTouchDeltaX = deltaX;
    }
  }, { passive: false });

  projectStack.addEventListener("touchend", () => {
    if (!mobileProjectsQuery.matches || Math.abs(projectTouchDeltaX) < 35) {
      return;
    }

    scrollToProjectCard(activeProjectIndex + (projectTouchDeltaX < 0 ? 1 : -1));
  });

  projectStack.addEventListener("wheel", (event) => {
    if (!mobileProjectsQuery.matches || projectWheelLock || Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
      return;
    }

    event.preventDefault();
    projectWheelLock = true;
    scrollToProjectCard(activeProjectIndex + (event.deltaX > 0 ? 1 : -1));

    window.setTimeout(() => {
      projectWheelLock = false;
    }, 520);
  }, { passive: false });

  window.addEventListener("resize", () => {
    if (mobileProjectsQuery.matches) {
      scrollToProjectCard(activeProjectIndex);
    }
  });

  projectStack.addEventListener("click", (event) => {
    const openButton = event.target.closest(".project-card__button");
    const closeButton = event.target.closest(".project-card__back-button");

    if (!openButton && !closeButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const currentCard = event.target.closest(".project-card");

    if (openButton && currentCard) {
      const isAlreadyOpen = currentCard.classList.contains("is-flipped");
      setProjectFlipped(isAlreadyOpen ? null : currentCard);
    }

    if (closeButton) {
      setProjectFlipped(null);
    }
  });

  document.addEventListener("click", (event) => {
    const openCard = projectStack.querySelector(".project-card.is-flipped");

    if (!openCard) return;
    if (event.target.closest(".project-card")) return;

    setProjectFlipped(null);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setProjectFlipped(null);
    }
  });
}

/* HISTORIA - stack anterior, si existe */
const historyCards = [...document.querySelectorAll(".history-card")];

const updateHistoryStack = (activeIndex) => {
  historyCards.forEach((card, index) => {
    card.classList.toggle("is-open", index === activeIndex);
    card.classList.toggle("is-before", index < activeIndex);
    card.classList.toggle("is-after", index > activeIndex);

    if (index > activeIndex) {
      card.style.setProperty("--after-index", index - activeIndex);
    } else {
      card.style.removeProperty("--after-index");
    }
  });
};

historyCards.forEach((card, index) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest(".history-card__button")) return;
    updateHistoryStack(index);
  });
});

if (historyCards.length) {
  const initialIndex = historyCards.findIndex((card) => card.classList.contains("is-open"));
  updateHistoryStack(initialIndex >= 0 ? initialIndex : 0);
}

/* HISTORIA - acordeon timeline */
const timelinePanels = document.querySelectorAll(".timeline-panel");

const updateTimelinePanels = (activeIndex) => {
  timelinePanels.forEach((panel, index) => {
    const button = panel.querySelector(".timeline-panel__button");

    panel.classList.toggle("is-active", index === activeIndex);
    panel.classList.toggle("is-before", index < activeIndex);
    panel.classList.toggle("is-after", index > activeIndex);

    button?.setAttribute("aria-expanded", index === activeIndex ? "true" : "false");
  });
};

timelinePanels.forEach((panel, index) => {
  const button = panel.querySelector(".timeline-panel__button");

  button?.addEventListener("click", () => {
    updateTimelinePanels(index);
  });
});

if (timelinePanels.length) {
  const initialIndex = [...timelinePanels].findIndex((panel) =>
    panel.classList.contains("is-active")
  );

  updateTimelinePanels(initialIndex >= 0 ? initialIndex : 0);
}

/* CONTACTO */
const contactMethods = document.querySelectorAll(".contact-method");
const contactOptions = document.querySelectorAll(".contact-option");
const contactForm = document.querySelector(".contact-form");
const contactMessage = document.querySelector(".contact-form__message");

contactMethods.forEach((method) => {
  method.addEventListener("click", () => {
    contactMethods.forEach((item) => item.classList.remove("is-selected"));
    method.classList.add("is-selected");
  });
});

contactOptions.forEach((option) => {
  option.addEventListener("click", () => {
    contactOptions.forEach((item) => item.classList.remove("is-selected"));
    option.classList.add("is-selected");
  });
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (contactMessage) {
    contactMessage.textContent = "Gracias, recibimos tu consulta.";
  }
});

const navbar = document.querySelector(".navbar");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");

const closeMobileNav = () => {
  navbar?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
};

if (navbar && navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileNav();
    }
  });

}



const courseGrid = document.querySelector(".courses__grid");
const courseDots = document.querySelectorAll(".courses-scroll-dots span");

if (courseGrid && courseDots.length) {
  const updateCourseDots = () => {
    const cards = Array.from(courseGrid.querySelectorAll(".course-card"));
    const gridCenter = courseGrid.scrollLeft + courseGrid.clientWidth / 2;

    let activeIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(gridCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        activeIndex = index;
      }
    });

    courseDots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  courseGrid.addEventListener("scroll", updateCourseDots, { passive: true });
  window.addEventListener("resize", updateCourseDots);
  updateCourseDots();
}




document.querySelectorAll(".before-after--hover").forEach((block) => {
  const image = block.querySelector(".before-after-hover__image");
  if (!image) return;

  const agedSrc = image.dataset.aged;
  let swapTimer;

  const revealImage = () => {
    if (block.classList.contains("is-revealed")) return;

    window.clearTimeout(swapTimer);
    block.classList.add("is-revealed");
    image.classList.add("is-fading");

    swapTimer = window.setTimeout(() => {
      image.src = agedSrc;
      image.classList.remove("is-fading");
    }, 180);
  };

  block.addEventListener("mouseenter", revealImage);
  block.addEventListener("touchstart", revealImage, { passive: true });
});








const initTestimonialCarousel = () => {
  const testimonialTrack = document.querySelector(".testimonial-carousel__track");
  const testimonialPrev = document.querySelector(".testimonial-carousel__arrow--prev");
  const testimonialNext = document.querySelector(".testimonial-carousel__arrow--next");

  if (!testimonialTrack || !testimonialPrev || !testimonialNext) return;

  const testimonialSlides = Array.from(testimonialTrack.querySelectorAll(".testimonial-slide"));
  let activeTestimonialIndex = 0;

  const getWrappedIndex = (index) => {
    return (index + testimonialSlides.length) % testimonialSlides.length;
  };

  const updateTestimonials = () => {
    const prevIndex = getWrappedIndex(activeTestimonialIndex - 1);
    const nextIndex = getWrappedIndex(activeTestimonialIndex + 1);

    testimonialSlides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === activeTestimonialIndex);
      slide.classList.toggle("is-prev", index === prevIndex);
      slide.classList.toggle("is-next", index === nextIndex);
    });
  };

  testimonialPrev.addEventListener("click", () => {
    activeTestimonialIndex = getWrappedIndex(activeTestimonialIndex - 1);
    updateTestimonials();
  });

  testimonialNext.addEventListener("click", () => {
    activeTestimonialIndex = getWrappedIndex(activeTestimonialIndex + 1);
    updateTestimonials();
  });

  updateTestimonials();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTestimonialCarousel);
} else {
  initTestimonialCarousel();
}




const layersSections = document.querySelectorAll(".layers");

layersSections.forEach((section) => {
  const buttons = Array.from(section.querySelectorAll(".layers__button"));

  const image = section.querySelector("[data-layers-image]");
  const number = section.querySelector("[data-layers-number]");
  const title = section.querySelector("[data-layers-title]");
  const description = section.querySelector("[data-layers-description]");
  const material = section.querySelector("[data-layers-material]");
  const technique = section.querySelector("[data-layers-technique]");
  const details = section.querySelector("[data-layers-details]");

  /* Nuevas imágenes de los círculos */
  const materialImage = section.querySelector(
    "[data-layers-material-image]"
  );

  const techniqueImage = section.querySelector(
    "[data-layers-technique-image]"
  );

  const canHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let activeButton =
    section.querySelector(".layers__button.is-active") || buttons[0];

  let changeTimer;

  /*
   * Precarga la imagen principal y las imágenes de los círculos
   * para evitar parpadeos al cambiar de etapa.
   */
  buttons.forEach((button) => {
    [
      button.dataset.layerImage,
      button.dataset.layerMaterialImage,
      button.dataset.layerTechniqueImage
    ]
      .filter(Boolean)
      .forEach((source) => {
        const preload = new Image();
        preload.src = source;
      });
  });

  const renderLayer = (button) => {
    if (
      !button ||
      !image ||
      !number ||
      !title ||
      !description ||
      !material ||
      !technique
    ) {
      return;
    }

    /* Imagen central */
    image.src = button.dataset.layerImage;
    image.alt = button.dataset.layerAlt || "";

    /* Información textual */
    number.textContent = button.dataset.layerNumber;
    title.textContent = button.dataset.layerTitle;
    description.textContent = button.dataset.layerDescription;
    material.textContent = button.dataset.layerMaterial;
    technique.textContent = button.dataset.layerTechnique;

    /* Fotografía del material */
    if (materialImage && button.dataset.layerMaterialImage) {
      materialImage.src = button.dataset.layerMaterialImage;
      materialImage.alt = button.dataset.layerMaterialAlt || "";
    }

    /* Icono de la técnica */
    if (techniqueImage && button.dataset.layerTechniqueImage) {
      techniqueImage.src = button.dataset.layerTechniqueImage;
      techniqueImage.alt = button.dataset.layerTechniqueAlt || "";
    }

    if (details) {
      details.textContent = button.dataset.layerDetails;
    }
  };

  const setActiveLayer = (button) => {
    if (!button || button === activeButton) {
      return;
    }

    activeButton = button;

    buttons.forEach((item) => {
      const isActive = item === activeButton;

      item.classList.toggle("is-active", isActive);
      item.setAttribute(
        "aria-pressed",
        isActive ? "true" : "false"
      );
    });

    window.clearTimeout(changeTimer);

    if (reduceMotion.matches) {
      renderLayer(activeButton);
      return;
    }

    section.classList.add("is-changing");

    changeTimer = window.setTimeout(() => {
      renderLayer(activeButton);
      section.classList.remove("is-changing");
    }, 170);
  };

  renderLayer(activeButton);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveLayer(button);
    });

    button.addEventListener("focus", () => {
      setActiveLayer(button);
    });

    button.addEventListener("mouseenter", () => {
      if (canHover.matches) {
        setActiveLayer(button);
      }
    });
  });
});







  const accordionItems = document.querySelectorAll(
    ".course-accordion details"
  );

  accordionItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      const video = item.querySelector(".course-accordion__video");

      if (!video) return;

      if (item.open) {
        video.currentTime = 0;

        video.play().catch(() => {
          // Evita errores visibles si el navegador bloquea la reproducción.
        });
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  });






  const mueblesTiles = document.querySelectorAll(".mueble-tile");

const closeOtherTiles = (selectedTile) => {
  mueblesTiles.forEach((tile) => {
    if (tile !== selectedTile) {
      tile.classList.remove("is-flipped");
      tile.setAttribute("aria-pressed", "false");
    }
  });
};

const toggleTile = (tile) => {
  const isFlipped = tile.classList.toggle("is-flipped");

  tile.setAttribute(
    "aria-pressed",
    isFlipped ? "true" : "false"
  );

  if (isFlipped) {
    closeOtherTiles(tile);
  }
};

mueblesTiles.forEach((tile) => {
  tile.addEventListener("click", () => {
    toggleTile(tile);
  });

  tile.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleTile(tile);
    }
  });
});


const mueblesGalleries = document.querySelectorAll(".muebles");

mueblesGalleries.forEach((section) => {
  const gallery = section.querySelector(".muebles__grid");
  const pagination = section.querySelector(".muebles__pagination");

  if (!gallery || !pagination) return;

  let visibleCards = [];
  let dots = [];
  let scrollTimer;

  const isMobile = () => {
    return window.matchMedia("(max-width: 680px)").matches;
  };

  const getVisibleCards = () => {
    return Array.from(
      gallery.querySelectorAll(".mueble-tile")
    ).filter((card) => {
      return window.getComputedStyle(card).display !== "none";
    });
  };

  const setActiveDot = (activeIndex) => {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);
      dot.setAttribute(
        "aria-current",
        isActive ? "true" : "false"
      );
    });
  };

  const goToCard = (index) => {
    const card = visibleCards[index];

    if (!card) return;

    gallery.scrollTo({
      left:
        card.offsetLeft -
        gallery.offsetLeft -
        parseFloat(getComputedStyle(gallery).paddingLeft),
      behavior: "smooth"
    });

    setActiveDot(index);
  };

  const createPagination = () => {
    pagination.innerHTML = "";
    visibleCards = getVisibleCards();

    if (!isMobile()) {
      dots = [];
      return;
    }

    visibleCards.forEach((card, index) => {
      const dot = document.createElement("button");

      dot.className = "muebles__dot";
      dot.type = "button";
      dot.setAttribute(
        "aria-label",
        `Mostrar pieza ${index + 1}`
      );

      dot.addEventListener("click", () => {
        goToCard(index);
      });

      pagination.appendChild(dot);
    });

    dots = Array.from(
      pagination.querySelectorAll(".muebles__dot")
    );

    setActiveDot(0);
  };

  const updatePaginationFromScroll = () => {
    if (!visibleCards.length) return;

    const galleryCenter =
      gallery.scrollLeft + gallery.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    visibleCards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(
        galleryCenter - cardCenter
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveDot(closestIndex);
  };

  gallery.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);

      scrollTimer = window.setTimeout(() => {
        updatePaginationFromScroll();
      }, 60);
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    window.clearTimeout(scrollTimer);

    scrollTimer = window.setTimeout(() => {
      createPagination();
      updatePaginationFromScroll();
    }, 150);
  });

  createPagination();
});





const automaticBeforeAfter = document.querySelectorAll(
  ".before-after--auto"
);

automaticBeforeAfter.forEach((container) => {
  const image = container.querySelector(
    ".before-after-auto__image"
  );

  if (!image) return;

  const restoredImage = image.dataset.original;
  const agedImage = image.dataset.aged;

  if (!restoredImage || !agedImage) return;

  /* Precarga ambas imágenes para evitar parpadeos */
  [restoredImage, agedImage].forEach((source) => {
    const preload = new Image();
    preload.src = source;
  });

  let showingRestored = true;

  window.setInterval(() => {
    container.classList.add("is-changing");

    window.setTimeout(() => {
      showingRestored = !showingRestored;

      image.src = showingRestored
        ? restoredImage
        : agedImage;

      image.alt = showingRestored
        ? "Pieza después de la restauración"
        : "Pieza antes de la restauración";

      container.classList.remove("is-changing");
    }, 320);
  }, 2600);
});





const teacherSections = document.querySelectorAll(
  ".teacher-hover-section"
);

teacherSections.forEach((section) => {
  const carousel = section.querySelector(
    ".teacher-hover-grid"
  );

  const pagination = section.querySelector(
    ".teacher-hover-pagination"
  );

  if (!carousel || !pagination) return;

  const cards = Array.from(
    carousel.querySelectorAll(".teacher-hover-card")
  );

  let dots = [];
  let scrollTimer;

  const setActiveDot = (activeIndex) => {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);

      dot.setAttribute(
        "aria-current",
        isActive ? "true" : "false"
      );
    });
  };

  const goToCard = (index) => {
    const card = cards[index];

    if (!card) return;

    carousel.scrollTo({
      left: card.offsetLeft - carousel.offsetLeft,
      behavior: "smooth"
    });

    setActiveDot(index);
  };

  cards.forEach((card, index) => {
    const dot = document.createElement("button");

    dot.className = "teacher-hover-dot";
    dot.type = "button";

    dot.setAttribute(
      "aria-label",
      `Mostrar integrante ${index + 1}`
    );

    dot.addEventListener("click", () => {
      goToCard(index);
    });

    pagination.appendChild(dot);
  });

  dots = Array.from(
    pagination.querySelectorAll(".teacher-hover-dot")
  );

  setActiveDot(0);

  carousel.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);

      scrollTimer = window.setTimeout(() => {
        const carouselCenter =
          carousel.scrollLeft + carousel.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
          const cardCenter =
            card.offsetLeft + card.offsetWidth / 2;

          const distance = Math.abs(
            carouselCenter - cardCenter
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveDot(closestIndex);
      }, 60);
    },
    { passive: true }
  );
});



const relatedCoursesSections = document.querySelectorAll(
  ".related-courses"
);

relatedCoursesSections.forEach((section) => {
  const carousel = section.querySelector(
    ".related-courses__home-grid"
  );

  const pagination = section.querySelector(
    ".related-courses__pagination"
  );

  if (!carousel || !pagination) return;

  const cards = Array.from(
    carousel.querySelectorAll(".course-card")
  );

  let dots = [];
  let scrollTimer;

  const setActiveDot = (activeIndex) => {
    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("is-active", isActive);

      dot.setAttribute(
        "aria-current",
        isActive ? "true" : "false"
      );
    });
  };

  const goToCard = (index) => {
    const card = cards[index];

    if (!card) return;

    carousel.scrollTo({
      left: card.offsetLeft - carousel.offsetLeft,
      behavior: "smooth"
    });

    setActiveDot(index);
  };

  cards.forEach((card, index) => {
    const dot = document.createElement("button");

    dot.className = "related-course-dot";
    dot.type = "button";

    dot.setAttribute(
      "aria-label",
      `Mostrar curso ${index + 1}`
    );

    dot.addEventListener("click", () => {
      goToCard(index);
    });

    pagination.appendChild(dot);
  });

  dots = Array.from(
    pagination.querySelectorAll(".related-course-dot")
  );

  setActiveDot(0);

  carousel.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);

      scrollTimer = window.setTimeout(() => {
        const carouselCenter =
          carousel.scrollLeft + carousel.clientWidth / 2;

        let closestIndex = 0;
        let closestDistance = Infinity;

        cards.forEach((card, index) => {
          const cardCenter =
            card.offsetLeft + card.offsetWidth / 2;

          const distance = Math.abs(
            carouselCenter - cardCenter
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveDot(closestIndex);
      }, 60);
    },
    { passive: true }
  );
});











/* =========================================
   ANIMACIONES DE ENTRADA CON SCROLL
   ========================================= */

const initScrollReveals = () => {
  /*
   * Evita inicializar dos veces si script.js
   * se carga accidentalmente más de una vez.
   */
  if (document.documentElement.dataset.revealInitialized) {
    return;
  }

  document.documentElement.dataset.revealInitialized = "true";

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (reduceMotion.matches) {
    return;
  }

  document.documentElement.classList.add("reveal-motion");

  const interactiveRevealExclusions = [
  ".history-accordion",
  ".testimonial-carousel__stage",
  ".course-hero__inner > .before-after"
];


  const registeredElements = new Set();

 const registerElement = (
  element,
  type = "up",
  delay = 0
) => {
  if (!element || registeredElements.has(element)) {
    return;
  }

  const isInteractiveComponent =
    interactiveRevealExclusions.some((selector) =>
      element.matches(selector)
    );

  if (isInteractiveComponent) {
    return;
  }

  registeredElements.add(element);

  element.classList.add("scroll-reveal");
  element.dataset.reveal = type;

  element.style.setProperty(
    "--reveal-delay",
    `${delay}ms`
  );
};

  const registerSelector = (
    selector,
    type = "up",
    delay = 0
  ) => {
    document.querySelectorAll(selector).forEach((element) => {
      registerElement(element, type, delay);
    });
  };

  const registerGroup = (
    containerSelector,
    itemSelector,
    type = "up",
    step = 90
  ) => {
    document
      .querySelectorAll(containerSelector)
      .forEach((container) => {
        const items = container.querySelectorAll(itemSelector);

        items.forEach((item, index) => {
          registerElement(
            item,
            type,
            Math.min(index * step, 360)
          );
        });
      });
  };

  /*
   * Encabezados y bloques generales
   */
  registerSelector(".hero-content", "up");
  registerSelector(".about__inner > .section-title", "up");
  registerSelector(".about__inner > .section-intro", "up", 80);

  registerSelector(".projects__inner > .section-title", "up");
  registerSelector(".projects__inner > .section-intro", "up", 80);
  registerSelector(".project-stack", "scale", 120);

  registerSelector(".courses__inner > .section-title", "up");
  registerSelector(".courses__inner > .section-intro", "up", 80);

  registerSelector(".history__header", "up");

  registerSelector(".muebles__inner > .section-title", "up");
  registerSelector(".muebles__inner > .section-intro", "up", 80);

  registerSelector(".testimonial-marquee__head", "up");
;

  registerSelector(".contact__content", "left");
  registerSelector(".contact__form-panel", "right", 100);

  registerSelector(".site-footer__grid", "up");
  registerSelector(".site-footer__bottom", "fade", 100);

  /*
   * Página de detalle del curso
   */
  registerSelector(".course-hero__content", "left");
;

  registerSelector(".course-program > .course-section-head", "up");
  registerSelector(".course-accordion", "up", 100);

  registerSelector(
    ".teacher-hover-section > .course-section-head",
    "up"
  );

  registerSelector(".course-enrollment__head", "up");
  registerSelector(".course-price-card", "left", 80);
  registerSelector(".course-enrollment__side", "right", 120);

  registerSelector(".layers__head", "up");
  registerSelector(".layers__media", "scale", 80);
  registerSelector(".layers__nav", "left", 100);
  registerSelector(".layers__info", "right", 140);

  registerSelector(
    ".related-courses > .course-section-head",
    "up"
  );

  /*
   * Grupos escalonados
   */
  registerGroup(
    ".about__values",
    ".value-card",
    "up",
    80
  );

  registerGroup(
    ".courses__grid",
    ".course-card",
    "up",
    100
  );

  registerGroup(
    ".muebles__grid",
    ".mueble-tile",
    "scale",
    80
  );

  registerGroup(
    ".course-facts",
    ".course-fact",
    "up",
    70
  );

  registerGroup(
    ".course-topics",
    "article",
    "up",
    85
  );

  registerGroup(
    ".course-accordion",
    "details",
    "up",
    70
  );

  registerGroup(
    ".teacher-hover-grid",
    ".teacher-hover-card",
    "up",
    90
  );

  registerGroup(
    ".course-benefits__grid",
    ".course-benefit-card",
    "up",
    80
  );

  registerGroup(
    ".course-payment-grid",
    ".course-payment-option",
    "up",
    90
  );

  registerGroup(
    ".related-courses__home-grid",
    ".course-card",
    "up",
    100
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  /*
   * Espera un frame para que el navegador registre
   * primero el estado oculto y luego anime la entrada.
   */
  window.requestAnimationFrame(() => {
    registeredElements.forEach((element) => {
      observer.observe(element);
    });
  });
};

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initScrollReveals,
    { once: true }
  );
} else {
  initScrollReveals();
}

registerSelector(".history__header", "up");

registerSelector(".testimonial-marquee__head", "up");

registerSelector(".course-hero__content", "left");




document
  .querySelectorAll(".course-accordion")
  .forEach((accordion) => {
    const items = Array.from(
      accordion.querySelectorAll("details")
    );

    items.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;

        items.forEach((otherItem) => {
          if (
            otherItem !== item &&
            otherItem.open
          ) {
            otherItem.open = false;
          }
        });
      });
    });
  });