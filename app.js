/**
 * APP.JS - CLUB LA CHECO OFICIAL
 * 1. Efecto 3D interactivo en el Escudo Oficial (Relieve y Física Parallax)
 * 2. Pasarela de Fotos y Carousel Dinámico con Filtros
 * 3. Lightbox a Pantalla Completa
 * 4. Menú Móvil y Scroll Fluido
 */

document.addEventListener("DOMContentLoaded", () => {
  initHeroCrestTilt();
  initPasarelaCarousel();
  initLightbox();
  initMobileNav();
  initSmoothScroll();
});

/* ==========================================================================
   1. ESCUDO OFICIAL EN 3D CON RELIEVE Y PARALLAX (.club-hero__crest-frame)
   Reacciona al movimiento del mouse o touch con inclinación y profundidad
   ========================================================================== */
function initHeroCrestTilt() {
  const stage = document.getElementById("heroCrestStage");
  const frame = document.getElementById("heroCrestFrame");
  if (!stage || !frame) return;

  let currentRotX = 0;
  let currentRotY = 0;
  let targetRotX = 0;
  let targetRotY = 0;
  let isHovering = false;

  function updateTilt() {
    if (isHovering) {
      currentRotX += (targetRotX - currentRotX) * 0.1;
      currentRotY += (targetRotY - currentRotY) * 0.1;
    } else {
      currentRotX += (0 - currentRotX) * 0.05;
      currentRotY += (0 - currentRotY) * 0.05;
    }

    frame.style.transform = `perspective(800px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(${isHovering ? 1.06 : 1}, ${isHovering ? 1.06 : 1}, 1)`;
    requestAnimationFrame(updateTilt);
  }

  requestAnimationFrame(updateTilt);

  function handlePointerMove(clientX, clientY) {
    const rect = frame.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const normX = (x / rect.width) * 2 - 1;
    const normY = (y / rect.height) * 2 - 1;

    targetRotY = normX * 20;
    targetRotX = -normY * 20;
  }

  stage.addEventListener("mousemove", (e) => {
    isHovering = true;
    handlePointerMove(e.clientX, e.clientY);
  });

  stage.addEventListener("mouseenter", () => {
    isHovering = true;
  });

  stage.addEventListener("mouseleave", () => {
    isHovering = false;
    targetRotX = 0;
    targetRotY = 0;
  });

  stage.addEventListener("touchstart", () => {
    isHovering = true;
  }, { passive: true });

  stage.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      isHovering = true;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  stage.addEventListener("touchend", () => {
    isHovering = false;
    targetRotX = 0;
    targetRotY = 0;
  });

  // Efecto de pulso al hacer clic
  frame.addEventListener("click", () => {
    frame.style.transform = "scale3d(1.15, 1.15, 1) rotateY(15deg)";
    setTimeout(() => {
      frame.style.transform = "";
    }, 350);
  });
}

/* ==========================================================================
   3. LA PASARELA: CAROUSEL INTERACTIVO CON FILTRADO
   ========================================================================== */
function initPasarelaCarousel() {
  const track = document.getElementById("pasarelaTrack");
  const prevBtn = document.getElementById("pasarelaPrev");
  const nextBtn = document.getElementById("pasarelaNext");
  const dotsContainer = document.getElementById("pasarelaDots");
  const filterBtns = document.querySelectorAll(".gallery-filters__btn");

  if (!track || !prevBtn || !nextBtn || !dotsContainer) return;

  let currentIndex = 0;
  let autoPlayTimer = null;
  let activeCards = Array.from(track.querySelectorAll(".pasarela-card"));

  function getStepWidth() {
    const card = activeCards[0] || track.querySelector(".pasarela-card");
    if (!card) return 300;
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 20;
    return card.offsetWidth + gap;
  }

  function getMaxIndex() {
    const viewportWidth = track.parentElement.offsetWidth;
    const cardWidth = getStepWidth();
    const visibleCards = Math.max(1, Math.floor(viewportWidth / cardWidth));
    return Math.max(0, activeCards.length - visibleCards);
  }

  function updateCarousel() {
    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    if (currentIndex < 0) currentIndex = 0;

    const step = getStepWidth();
    const translateX = -(currentIndex * step);
    track.style.transform = `translateX(${translateX}px)`;

    updateDots(maxIndex);
  }

  function updateDots(maxIndex) {
    dotsContainer.innerHTML = "";
    const totalDots = Math.min(maxIndex + 1, 8);
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.className = `pasarela-dot ${i === currentIndex ? "pasarela-dot--active" : ""}`;
      dot.setAttribute("aria-label", `Ir a elemento ${i + 1}`);
      dot.addEventListener("click", () => {
        currentIndex = i;
        updateCarousel();
      });
      dotsContainer.appendChild(dot);
    }
  }

  prevBtn.addEventListener("click", () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  nextBtn.addEventListener("click", () => {
    const maxIndex = getMaxIndex();
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateCarousel();
  });

  // Autoplay continuo con pausa al hacer hover
  function startAutoplay() {
    stopAutoplay();
    autoPlayTimer = setInterval(() => {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    }, 4200);
  }

  function stopAutoplay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  track.parentElement.addEventListener("mouseenter", stopAutoplay);
  track.parentElement.addEventListener("mouseleave", startAutoplay);

  // Soporte táctil / touch swipe
  let startX = 0;
  let isSwiping = false;

  track.parentElement.addEventListener("touchstart", (e) => {
    stopAutoplay();
    startX = e.touches[0].clientX;
    isSwiping = true;
  }, { passive: true });

  track.parentElement.addEventListener("touchend", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const diff = e.changedTouches[0].clientX - startX;
    if (diff > 40) {
      currentIndex = Math.max(0, currentIndex - 1);
      updateCarousel();
    } else if (diff < -40) {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    }
    startAutoplay();
  }, { passive: true });

  // Filtros de categoría
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("gallery-filters__btn--active"));
      btn.classList.add("gallery-filters__btn--active");

      const category = btn.getAttribute("data-category");
      const allCards = Array.from(track.querySelectorAll(".pasarela-card"));

      allCards.forEach((card) => {
        const cardCat = card.getAttribute("data-category");
        if (category === "todas" || cardCat === category) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });

      activeCards = allCards.filter((card) => card.style.display !== "none");
      currentIndex = 0;
      updateCarousel();
    });
  });

  window.addEventListener("resize", () => {
    updateCarousel();
  });

  updateCarousel();
  startAutoplay();
}

/* ==========================================================================
   4. LIGHTBOX A PANTALLA COMPLETA
   ========================================================================== */
function initLightbox() {
  const lightbox = document.getElementById("lightboxModal");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxDesc = document.getElementById("lightboxDesc");
  const closeBtn = document.getElementById("lightboxClose");
  const cards = document.querySelectorAll(".pasarela-card");

  if (!lightbox || !lightboxImg || !lightboxTitle || !lightboxDesc || !closeBtn) return;

  function openLightbox(imgSrc, title, desc) {
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightbox.classList.add("lightbox--active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("lightbox--active");
    document.body.style.overflow = "";
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector(".pasarela-card__img");
      const title = card.querySelector(".pasarela-card__title")?.textContent || "Club La Checo";
      const desc = card.querySelector(".pasarela-card__caption")?.textContent || "";
      if (img) {
        openLightbox(img.src, title, desc);
      }
    });
  });

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox.classList.contains("lightbox--active")) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   5. MENÚ MÓVIL
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  if (!toggleBtn || !menu) return;

  toggleBtn.addEventListener("click", () => {
    menu.classList.toggle("jersey-nav__menu--open");
    const isExpanded = menu.classList.contains("jersey-nav__menu--open");
    toggleBtn.setAttribute("aria-expanded", isExpanded);
  });

  const links = menu.querySelectorAll(".jersey-nav__link");
  links.forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("jersey-nav__menu--open");
    });
  });
}

/* ==========================================================================
   6. SCROLL FLUIDO
   ========================================================================== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}
