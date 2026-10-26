(() => {
  "use strict";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }

  if (!hasGSAP || reduceMotion) {
    document.querySelector(".preloader")?.remove();
    document.querySelectorAll(".reveal").forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Pointer glow + custom cursor make the visual system feel tactile on desktop.
  const glow = document.querySelector(".cursor-glow");
  const cursor = document.querySelector(".custom-cursor");
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.body.classList.add("js-cursor");
    window.addEventListener("pointermove", event => {
      if (glow) gsap.to(glow, { x: event.clientX, y: event.clientY, duration: .7, ease: "power3.out", overwrite: true });
      if (cursor) gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: .12, ease: "power2.out", overwrite: true });
    }, { passive: true });
  }

  // Small magnetic response for key actions, kept subtle so links stay usable.
  gsap.utils.toArray(".header-contact, .round-link, .contact-orb, .replay-button").forEach(el => {
    el.addEventListener("pointermove", event => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const rect = el.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * .08;
      const dy = (event.clientY - rect.top - rect.height / 2) * .08;
      gsap.to(el, { x: dx, y: dy, duration: .25, ease: "power2.out" });
    });
    el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: .45, ease: "elastic.out(1,.4)" }));
  });

  const preloader = document.querySelector(".preloader");
  const loaderNumber = document.querySelector(".loader-percent");
  const loaderState = { value: 0 };

  gsap.to(loaderState, {
    value: 100, duration: 1.25, ease: "power2.inOut",
    onUpdate: () => { if (loaderNumber) loaderNumber.textContent = String(Math.round(loaderState.value)).padStart(2, "0"); },
    onComplete: () => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.to(preloader.querySelector(".loader-line span"), { width: "100%", duration: .2 }, 0)
        .to(preloader, { yPercent: -100, duration: .8, ease: "power4.inOut" })
        .from(".site-header", { y: -25, opacity: 0, duration: .45 }, "-=.25")
        .from(".hero-kicker", { y: 18, opacity: 0, duration: .45 }, "-=.25")
        .from(".title-line > span:first-child", { yPercent: 115, duration: .85, stagger: .13, ease: "power4.out" }, "-=.15")
        .from(".hero-bottom > *", { y: 20, opacity: 0, duration: .55, stagger: .1 }, "-=.42")
        .from(".hero-scribble", { scale: .6, opacity: 0, rotation: -5, duration: .5 }, "-=.4")
        .set(preloader, { display: "none" });
    }
  });

  // Scroll-triggered section reveals.
  gsap.utils.toArray(".reveal").forEach(el => {
    gsap.fromTo(el, { y: 35, opacity: 0 }, {
      y: 0, opacity: 1, duration: .8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%", once: true }
    });
  });

  // Infinite text ribbon, with a gentle pause on hover.
  const marquee = document.querySelector(".marquee-track");
  if (marquee) {
    marquee.addEventListener("mouseenter", () => gsap.to(marquee, { timeScale: .35, duration: .4 }));
    marquee.addEventListener("mouseleave", () => gsap.to(marquee, { timeScale: 1, duration: .4 }));
  }

  // Floating tech chips: each has its own slow, offset loop.
  gsap.utils.toArray("[data-float]").forEach((item, i) => {
    gsap.to(item, { y: i % 2 ? -13 : 13, rotation: i % 2 ? 5 : -5, duration: 2.1 + i * .16, repeat: -1, yoyo: true, ease: "sine.inOut", delay: i * .12 });
    item.addEventListener("mouseenter", () => gsap.to(item, { scale: 1.12, duration: .25, ease: "back.out(2)" }));
    item.addEventListener("mouseleave", () => gsap.to(item, { scale: 1, duration: .25, ease: "power2.out" }));
  });

  // Pinned horizontal project rail. Use vertical stacked cards on small screens.
  const track = document.querySelector(".project-track");
  const pin = document.querySelector(".project-pin");
  const desktopQuery = window.matchMedia("(min-width: 651px)");
  let horizontalTween;
  function setupProjects() {
    if (horizontalTween) {
      horizontalTween.scrollTrigger?.kill();
      horizontalTween.kill();
      horizontalTween = null;
    }
    gsap.set(track, { clearProps: "transform" });
    if (desktopQuery.matches) {
      const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);
      horizontalTween = gsap.to(track, {
        x: () => -distance(), ease: "none",
        scrollTrigger: {
          trigger: pin, start: "top top+=20", end: () => "+=" + (distance() + window.innerHeight * .35),
          pin: true, scrub: 1, invalidateOnRefresh: true
        }
      });
    } else {
      gsap.set(track, { x: 0 });
    }
  }
  setupProjects();
  window.addEventListener("resize", gsap.utils.debounce(() => { setupProjects(); ScrollTrigger.refresh(); }, 180));

  // A restrained parallax touch on the hero lettering and orbital rings.
  gsap.to(".hero-scribble", {
    y: -45, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: .8 }
  });
  gsap.to(".orbit-three", {
    rotation: 28, ease: "none",
    scrollTrigger: { trigger: ".stack", start: "top bottom", end: "bottom top", scrub: 1 }
  });
  gsap.to(".orbit-two", {
    rotation: -22, ease: "none",
    scrollTrigger: { trigger: ".stack", start: "top bottom", end: "bottom top", scrub: 1 }
  });

  // Motion playground: intentionally separate timeline that can be replayed.
  const replay = document.getElementById("replay-motion");
  const status = document.getElementById("lab-status");
  const coordX = document.getElementById("coord-x");
  const coordY = document.getElementById("coord-y");
  let labTimeline;
  function playLab() {
    if (labTimeline) labTimeline.kill();
    gsap.set([".circle-a", ".circle-b", ".lab-square", ".lab-type"], { clearProps: "all" });
    if (status) status.textContent = "PLAYING";
    const counter = { x: 0, y: 0 };
    labTimeline = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => { if (status) status.textContent = "COMPLETE"; }
    });
    labTimeline
      .fromTo(".circle-a", { x: -70, y: 45, scale: .55, rotation: -35 }, { x: 55, y: -25, scale: 1.2, rotation: 45, duration: .8 })
      .fromTo(".circle-b", { x: 80, y: -40, scale: .6 }, { x: -55, y: 25, scale: 1.25, duration: .7 }, "<")
      .fromTo(".lab-square", { rotation: -45, scale: .5, x: 30 }, { rotation: 135, scale: 1.2, x: -35, duration: .75 }, "<")
      .fromTo(".lab-type", { y: 22, opacity: .45, letterSpacing: "-.12em" }, { y: 0, opacity: 1, letterSpacing: "-.08em", duration: .55 }, "-=.35")
      .to(counter, { x: 128, y: 64, duration: .9, onUpdate: () => {
        if (coordX) coordX.textContent = String(Math.round(counter.x)).padStart(3, "0");
        if (coordY) coordY.textContent = String(Math.round(counter.y)).padStart(3, "0");
      } }, "-=.65");
  }
  if (replay) replay.addEventListener("click", playLab);

  // Contact entrance is a single composed moment, not a cascade on every item.
  gsap.from(".contact-title span", {
    yPercent: 105, opacity: 0, stagger: .16, duration: 1, ease: "power4.out",
    scrollTrigger: { trigger: ".contact-main", start: "top 78%", once: true }
  });
  gsap.from(".contact-orb", {
    scale: 0, rotation: -30, duration: .7, ease: "back.out(1.8)",
    scrollTrigger: { trigger: ".contact-main", start: "top 65%", once: true }
  });

  // Keep anchor navigation comfortable without hijacking native links.
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
})();
