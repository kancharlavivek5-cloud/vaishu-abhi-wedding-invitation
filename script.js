/* ============================================================
   MARRIAGE INVITATION — MAIN SCRIPT
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Set by setupAutoProgress(), called by setupGate() the instant the guest
// taps "Open Invitation" — this is what makes the auto-progress timer count
// from gate-open instead of from page-load.
let startAutoProgress = null;

document.addEventListener('DOMContentLoaded', function () {
    populateConfig();
    setupGate();
    setupSceneNav();
    setupReveals();
    setupCountdown();
    setupGallery();
    setupLightbox();
    setupMusic();
    setupAutoProgress();
    setupSwipeNav();
    setupProgressThread();
    setupShimmerText();
    setupParallax();
    setupAmbientParticles();
});

/* ============================================================
   THEME PRESETS
   ============================================================ */

const THEME_PRESETS = {
    // ---- Bold "premium" palettes, matched to the 3 `style` options ----
    imperialGold:    { primary: '#6E1423', secondary: '#C9A961', accent: '#F2CB6E', background: '#FBF3E3', ink: '#241109', glow: '246,197,102' },
    noirCinema:      { primary: '#E9DFC8', secondary: '#8A8F98', accent: '#E4C874', background: '#0B0C10', ink: '#F4F1E9', glow: '228,200,116' },
    blushEditorial:  { primary: '#FF3B3B', secondary: '#111111', accent: '#FFE14D', background: '#FAF7F0', ink: '#111111', glow: '255,225,77' },
    // ---- Original quieter palettes, kept for flexibility ----
    ivoryGold:     { primary: '#8B6B6B', secondary: '#C9A961', accent: '#D4AF37', background: '#FEFDFB', ink: '#2C2C2C', glow: '212,175,55' },
    blackGold:     { primary: '#2C2C2C', secondary: '#666666', accent: '#D4AF37', background: '#FFFFFF', ink: '#1a1a1a', glow: '212,175,55' },
    deepGreenGold: { primary: '#2F4A3C', secondary: '#7C9A85', accent: '#C9A961', background: '#F7F7F2', ink: '#20291f', glow: '201,169,97' },
    roseChampagne: { primary: '#A0707D', secondary: '#D4A8A8', accent: '#B76D75', background: '#FAF7F2', ink: '#332226', glow: '183,109,117' },
    burgundyGold:  { primary: '#5E2129', secondary: '#8B4750', accent: '#D4AF37', background: '#FBF6F1', ink: '#2b1416', glow: '212,175,55' },
    minimalIvory:  { primary: '#4A4A4A', secondary: '#999999', accent: '#B7A98E', background: '#FFFFFF', ink: '#3a3a3a', glow: '183,169,142' }
};

function applyTheme() {
    const cfgTheme = (typeof INVITE_CONFIG !== 'undefined' && INVITE_CONFIG.theme) || {};
    let values;
    if (cfgTheme.preset === 'custom' && cfgTheme.custom) {
        values = cfgTheme.custom;
    } else {
        values = THEME_PRESETS[cfgTheme.preset] || THEME_PRESETS.imperialGold;
    }
    const root = document.documentElement;
    if (values.primary) root.style.setProperty('--primary', values.primary);
    if (values.secondary) root.style.setProperty('--secondary', values.secondary);
    if (values.accent) root.style.setProperty('--accent', values.accent);
    if (values.background) root.style.setProperty('--background', values.background);
    if (values.ink) root.style.setProperty('--ink', values.ink);
    if (values.glow) root.style.setProperty('--accent-glow', values.glow);

    // Visual style (royal | cinematic | editorial) drives decorative motion + particles
    const style = (typeof INVITE_CONFIG !== 'undefined' && INVITE_CONFIG.style) || 'royal';
    document.documentElement.setAttribute('data-style', style);
}

/* ============================================================
   POPULATE FROM CONFIG
   ============================================================ */

function populateConfig() {
    if (typeof INVITE_CONFIG === 'undefined') {
        console.error('INVITE_CONFIG is missing — check config.js is loaded before script.js');
        return;
    }
    const cfg = INVITE_CONFIG;

    applyTheme();

    const eventDate = new Date(cfg.eventDate);
    const formattedDate = formatDateLong(eventDate);       // "December 25, 2026"
    const formattedDateShort = formatDateDayFirst(eventDate); // "25 December 2026"

    // Gate
    setText('gateEyebrow', (cfg.gate && cfg.gate.eyebrow) || 'You Are Invited');
    setText('gateButtonLabel', (cfg.gate && cfg.gate.buttonLabel) || 'Open Invitation');
    setText('gateDate', formattedDateShort);
    const gateSealInitials = document.getElementById('gateSealInitials');
    if (gateSealInitials) gateSealInitials.textContent = firstLetter(cfg.groomName) + '&' + firstLetter(cfg.brideName);
    const gateNamesText = document.getElementById('gateNamesText');
    if (gateNamesText) {
        gateNamesText.innerHTML = escapeHtml(cfg.brideName) + '<span class="gate-amp">&amp;</span>' + escapeHtml(cfg.groomName);
    }

    // Hero
    setText('heroGroom', cfg.groomName);
    setText('heroBride', cfg.brideName);
    setText('heroDate', formattedDate);
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && cfg.hero && cfg.hero.subtitle) heroSubtitle.textContent = cfg.hero.subtitle;
    const couplePhoto = cfg.photos && cfg.photos.couple;
    setImg('heroPhoto', couplePhoto);

    // Invitation
    const invitationBox = document.getElementById('invitationText');
    if (invitationBox) {
        invitationBox.innerHTML = '';
        const lines = Array.isArray(cfg.invitation) ? cfg.invitation : [cfg.invitation];
        lines.filter(Boolean).forEach(line => {
            const p = document.createElement('p');
            p.textContent = line;
            invitationBox.appendChild(p);
        });
    }

    // Countdown scene visibility
    if (cfg.countdown && cfg.countdown.enabled === false) {
        hideScene('scene-countdown');
    }

    // Events
    populateEvents(cfg.events || []);

    // Story
    if (cfg.story && cfg.story.enabled) {
        const storyScene = document.getElementById('scene-story');
        if (storyScene) storyScene.style.display = 'flex';
        setText('storyTitle', cfg.story.title || 'Our Story');
        setText('storyIntro', cfg.story.intro || '');
        setText('storyClosing', cfg.story.closing || '');
        populateMilestones(cfg.story.milestones || []);
    }

    // Venue
    setText('venueName', cfg.venue && cfg.venue.name);
    setText('venueAddress', cfg.venue && cfg.venue.address);
    setImg('venuePhoto', cfg.photos && cfg.photos.venue);
    const venueDirections = document.getElementById('venueDirections');
    if (venueDirections && cfg.venue && cfg.venue.mapUrl) venueDirections.href = `https://maps.app.goo.gl/ZZmKUuwajdouSoWaA`;
    const venueMapFrame = document.getElementById('venueMapFrame');
    if (venueMapFrame && cfg.venue && cfg.venue.mapUrl) venueMapFrame.src = cfg.venue.mapUrl;

    // Gallery
    populateGalleryGrid((cfg.photos && cfg.photos.gallery) || []);

    // Music
    const audio = document.getElementById('audioElement');
    const musicToggle = document.getElementById('musicToggle');
    if (cfg.music && cfg.music.enabled && cfg.music.file) {
        if (audio) audio.src = cfg.music.file;
        if (musicToggle) musicToggle.style.display = 'flex';
    }

    // Final scene (reuses the couple photo — no separate photo needed)
    setImg('finalPhoto', (cfg.finalScene && cfg.finalScene.photo) || couplePhoto);
    setText('finalNames', cfg.brideName + ' & ' + cfg.groomName);
    setText('finalMessage', (cfg.finalScene && cfg.finalScene.message) || "We can't wait to celebrate with you.");
    setText('finalDate', formattedDate);
}

function firstLetter(name) {
    return name ? name.trim().charAt(0).toUpperCase() : '';
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined && value !== null) el.textContent = value;
}

function setImg(id, src) {
    const el = document.getElementById(id);
    if (el && src) { el.src = src; el.alt = ''; }
}

function hideScene(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

/* ============================================================
   EVENTS TIMELINE
   ============================================================ */

function populateEvents(events) {
    const container = document.getElementById('eventsTimeline');
    if (!container) return;
    container.innerHTML = '';

    events.forEach((event, index) => {
        const item = document.createElement('div');
        item.className = 'event-item';
        item.setAttribute('data-reveal', 'rise');
        item.style.setProperty('--delay', (index * 90) + 'ms');

        const eventDate = new Date(event.date);
        const formatted = eventDate.getDate() + ' ' + MONTH_NAMES[eventDate.getMonth()];

        item.innerHTML = `
            <h3 class="event-name">${escapeHtml(event.name)}</h3>
            <p class="event-meta">${formatted} &middot; ${escapeHtml(event.time || '')}</p>
            <p class="event-venue">${escapeHtml(event.venue || '')}</p>
            ${event.description ? `<p class="event-desc">${escapeHtml(event.description)}</p>` : ''}
        `;
        container.appendChild(item);

        if (index < events.length - 1) {
            const divider = document.createElement('div');
            divider.className = 'event-divider';
            divider.setAttribute('data-reveal', 'fade');
            divider.innerHTML = `<svg width="60" height="20" viewBox="0 0 60 20"><path d="M0 10 Q30 -5 60 10"/></svg>`;
            container.appendChild(divider);
        }
    });
}

/* ============================================================
   STORY MILESTONES
   ============================================================ */

function populateMilestones(milestones) {
    const container = document.getElementById('storyMilestones');
    if (!container) return;
    container.innerHTML = '';

    milestones.forEach((m, index) => {
        const div = document.createElement('div');
        div.className = 'milestone' + (index % 2 === 1 ? ' milestone-reverse' : '');
        div.setAttribute('data-reveal', 'fade');
        div.style.setProperty('--delay', (index * 120) + 'ms');
        div.innerHTML = `
            ${m.photo ? `<img class="milestone-photo" src="${m.photo}" alt="" loading="lazy">` : ''}
            <div class="milestone-text-block">
                <p class="milestone-date">${escapeHtml(m.date || '')}</p>
                <p class="milestone-text">${escapeHtml(m.text || '')}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

/* ============================================================
   GALLERY
   ============================================================ */

let galleryImages = [];

function populateGalleryGrid(images) {
    galleryImages = images;
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    images.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-reveal', 'fade');
        item.style.setProperty('--delay', (index * 60) + 'ms');
        item.innerHTML = `<img src="${src}" alt="Gallery photo ${index + 1}" loading="lazy">`;
        item.addEventListener('click', () => openLightbox(index));
        grid.appendChild(item);
    });
}

function setupGallery() { /* population happens in populateConfig -> populateGalleryGrid */ }

/* ============================================================
   LIGHTBOX
   ============================================================ */

function setupLightbox() {
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const lightbox = document.getElementById('lightbox');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));
    if (lightbox) {
        lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    }
    document.addEventListener('keydown', (e) => {
        if (!lightbox || lightbox.style.display !== 'flex') return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImage');
    if (!lightbox || !img) return;
    img.src = galleryImages[index];
    lightbox.dataset.index = index;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
}
function navigateLightbox(dir) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    let i = parseInt(lightbox.dataset.index || '0', 10) + dir;
    if (i < 0) i = galleryImages.length - 1;
    if (i >= galleryImages.length) i = 0;
    document.getElementById('lightboxImage').src = galleryImages[i];
    lightbox.dataset.index = i;
}

/* ============================================================
   GATE — opening interaction
   ============================================================ */

function setupGate() {
    const gate = document.getElementById('gate');
    const button = document.getElementById('gateButton');
    const experience = document.getElementById('experience');

    if (!gate || !button || !experience) return;

    button.addEventListener('click', function () {
        // Attempt music playback triggered by this user gesture
        const audio = document.getElementById('audioElement');
        if (audio && audio.src) {
            audio.play().catch(() => {
                // Autoplay blocked — leave music control visible for manual play
            });
        }

        gate.classList.add('gate-closed');
        experience.removeAttribute('aria-hidden');

        setTimeout(() => {
            gate.style.display = 'none';
        }, prefersReducedMotion ? 0 : 1450);

        // kick off first-scene reveal immediately
        triggerRevealsIn(document.getElementById('scene-hero'));

        window.__inviteOpened = true;

        // Start the auto-progress countdown NOW — from the moment the guest
        // actually opens the invitation, not from when the page first loaded.
        if (typeof startAutoProgress === 'function') {
            startAutoProgress();
        }
    }, { once: true });
}

/* ============================================================
   SCENE REVEALS (IntersectionObserver)
   ============================================================ */

function setupReveals() {
    if (prefersReducedMotion) {
        document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                triggerRevealsIn(entry.target);
            }
        });
    }, { threshold: 0.35 });

    document.querySelectorAll('.scene').forEach(scene => observer.observe(scene));
}

function triggerRevealsIn(scene) {
    if (!scene) return;
    scene.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('in-view'));
}

/* ============================================================
   SCENE NAV DOTS
   ============================================================ */

function setupSceneNav() {
    const nav = document.getElementById('sceneNav');
    const scenes = document.querySelectorAll('.scene');
    const experience = document.getElementById('experience');
    if (!nav || !scenes.length || !experience) return;

    scenes.forEach((scene, i) => {
        const dot = document.createElement('button');
        dot.className = 'scene-nav-dot';
        dot.setAttribute('aria-label', 'Go to scene ' + (i + 1));
        dot.addEventListener('click', () => {
            scene.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
        nav.appendChild(dot);
    });

    const dots = nav.querySelectorAll('.scene-nav-dot');
    const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = Array.from(scenes).indexOf(entry.target);
                dots.forEach(d => d.classList.remove('active'));
                if (dots[idx]) dots[idx].classList.add('active');
            }
        });
    }, { threshold: 0.5 });

    scenes.forEach(scene => activeObserver.observe(scene));
}

/* ============================================================
   COUNTDOWN
   ============================================================ */

function setupCountdown() {
    if (typeof INVITE_CONFIG === 'undefined') return;
    if (INVITE_CONFIG.countdown && INVITE_CONFIG.countdown.enabled === false) return;

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

let __lastCountdown = { d: null, h: null, m: null, s: null };

function updateCountdown() {
    const cfg = INVITE_CONFIG;
    const target = new Date(cfg.eventDate + ' ' + cfg.eventTime).getTime();
    const now = Date.now();
    const distance = Math.max(0, target - now);

    const d = Math.floor(distance / 86400000);
    const h = Math.floor((distance % 86400000) / 3600000);
    const m = Math.floor((distance % 3600000) / 60000);
    const s = Math.floor((distance % 60000) / 1000);

    setCountdownDigit('cdDays', d);
    setCountdownDigit('cdHours', h);
    setCountdownDigit('cdMinutes', m);
    setCountdownDigit('cdSeconds', s);
}

function setCountdownDigit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const padded = String(value).padStart(2, '0');
    if (el.textContent !== padded) {
        el.textContent = padded;
        if (!prefersReducedMotion) {
            el.classList.remove('tick');
            void el.offsetWidth; // restart animation
            el.classList.add('tick');
        }
    }
}

/* ============================================================
   MUSIC TOGGLE
   ============================================================ */

function setupMusic() {
    const toggle = document.getElementById('musicToggle');
    const audio = document.getElementById('audioElement');
    if (!toggle || !audio) return;

    toggle.addEventListener('click', function () {
        if (audio.paused) {
            audio.play().catch(() => {});
            toggle.classList.remove('paused');
        } else {
            audio.pause();
            toggle.classList.add('paused');
        }
    });
}

/* ============================================================
   GENTLE AUTO-PROGRESSION
   Starts a few seconds after gate opens. Stops permanently
   the instant the guest interacts in any way.
   ============================================================ */

function setupAutoProgress() {
    if (prefersReducedMotion) return;
    if (typeof INVITE_CONFIG === 'undefined') return;
    if (!INVITE_CONFIG.autoProgress || INVITE_CONFIG.autoProgress.enabled === false) return;

    const experience = document.getElementById('experience');
    if (!experience) return;
    const scenes = Array.from(document.querySelectorAll('.scene')).filter(el => el.style.display !== 'none');
    if (!scenes.length) return;

    const BASE_SPEED = 0.3;           // px/frame baseline (~18px/sec at 60fps)
    const START_DELAY_MS = 3000;      // pause after gate-open before auto-scroll begins
    const IDLE_RESUME_DELAY_MS = 20000; // how long guest must be idle before the resume pill offers to continue

    let running = false;
    let rafId = null;
    let armTimeout = null;
    let idleTimer = null;
    let sceneOffsets = [];
    let frameCount = 0;
    let currentSpeed = BASE_SPEED;

    const resumeBtn = document.getElementById('resumePill');

    // Recomputed each time auto-progress engages, since layout may have
    // settled/changed since page load (fonts loading, images sizing, etc).
    function refreshSceneOffsets() {
        sceneOffsets = scenes.map(el => ({
            type: el.dataset.scene,
            top: el.offsetTop,
            height: el.offsetHeight
        }));
    }

    function isNearBottom() {
        return experience.scrollTop + experience.clientHeight >= experience.scrollHeight - 4;
    }

    // Variable dwell: content-heavy scenes get a slower crawl speed (more
    // real time spent there), simple scenes move a little quicker — while
    // staying a single continuous motion rather than discrete jumps.
    function speedForSceneType(type) {
        function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
        switch (type) {
            case 'events': {
                const count = document.getElementById('eventsTimeline')
                    ? document.getElementById('eventsTimeline').querySelectorAll('.event-item').length : 0;
                return BASE_SPEED * clamp(1.5 - count * 0.08, 0.45, 1.1);
            }
            case 'gallery': {
                const count = (typeof galleryImages !== 'undefined') ? galleryImages.length : 0;
                return BASE_SPEED * clamp(1.5 - count * 0.09, 0.5, 1.1);
            }
            case 'story': {
                const count = document.getElementById('storyMilestones')
                    ? document.getElementById('storyMilestones').children.length : 0;
                return BASE_SPEED * clamp(1.4 - count * 0.15, 0.5, 1.1);
            }
            case 'countdown':
            case 'invitation':
                return BASE_SPEED * 1.3; // lighter scenes, move a touch quicker
            default:
                return BASE_SPEED;
        }
    }

    function updateCurrentSpeed() {
        const mid = experience.scrollTop + experience.clientHeight / 2;
        let match = sceneOffsets[sceneOffsets.length - 1];
        for (const s of sceneOffsets) {
            if (mid >= s.top && mid < s.top + s.height) { match = s; break; }
        }
        currentSpeed = speedForSceneType(match ? match.type : undefined);
    }

    function step() {
        if (!running) return;
        frameCount++;
        if (frameCount % 12 === 0) updateCurrentSpeed(); // recheck ~5x/sec, not every frame
        if (isNearBottom()) { pauseAuto(false); return; } // reached the end naturally
        experience.scrollTop += currentSpeed;
        rafId = requestAnimationFrame(step);
    }

    function beginAuto() {
        if (running) return;
        running = true;
        clearIdlePrompt();
        refreshSceneOffsets();
        frameCount = 0;
        updateCurrentSpeed();
        rafId = requestAnimationFrame(step);
    }

    function pauseAuto(offerResume) {
        if (running) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        }
        if (offerResume) scheduleIdlePrompt();
    }

    function scheduleIdlePrompt() {
        clearIdlePrompt();
        if (isNearBottom()) return; // nothing left to continue to
        idleTimer = setTimeout(showResumePill, IDLE_RESUME_DELAY_MS);
    }

    function clearIdlePrompt() {
        if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
        hideResumePill();
    }

    function showResumePill() {
        if (resumeBtn) resumeBtn.classList.add('visible');
    }
    function hideResumePill() {
        if (resumeBtn) resumeBtn.classList.remove('visible');
    }

    // Any real user gesture pauses auto-progress. It never resumes on its
    // own — only an explicit tap on the resume pill brings it back.
    function onUserInteraction() {
        if (armTimeout) { clearTimeout(armTimeout); armTimeout = null; }
        pauseAuto(true);
    }
    ['wheel', 'touchstart', 'pointerdown', 'keydown'].forEach(evt => {
        experience.addEventListener(evt, onUserInteraction, { passive: true });
    });

    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            hideResumePill();
            beginAuto();
        });
    }

    // Called by setupGate() the instant the guest taps "Open Invitation" —
    // the 3s pause counts from that tap, not from page load.
    startAutoProgress = function () {
        armTimeout = setTimeout(() => {
            armTimeout = null;
            beginAuto();
        }, START_DELAY_MS);
    };
}

/* ============================================================
   SWIPE NAVIGATION — horizontal swipe = next/previous scene.
   Purely additive to existing scroll/dots navigation. Ignores
   vertical swipes (normal scrolling) and does not interfere with
   the lightbox, which lives outside #experience in the DOM.
   ============================================================ */

function setupSwipeNav() {
    const experience = document.getElementById('experience');
    if (!experience) return;
    const scenes = Array.from(document.querySelectorAll('.scene')).filter(el => el.style.display !== 'none');
    if (scenes.length < 2) return;

    const SWIPE_THRESHOLD_PX = 60;
    const HORIZONTAL_DOMINANCE = 1.4; // horizontal delta must exceed vertical by this factor to count as a swipe, not a scroll

    let startX = 0, startY = 0, tracking = false;

    experience.addEventListener('touchstart', (e) => {
        if (!e.touches || e.touches.length !== 1) { tracking = false; return; }
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
    }, { passive: true });

    experience.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;
        const touch = e.changedTouches && e.changedTouches[0];
        if (!touch) return;

        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < SWIPE_THRESHOLD_PX || absDx < absDy * HORIZONTAL_DOMINANCE) return; // not a clear horizontal swipe

        const currentIndex = currentSceneIndex(scenes, experience);
        const targetIndex = dx < 0
            ? Math.min(scenes.length - 1, currentIndex + 1)  // swiped left -> next scene
            : Math.max(0, currentIndex - 1);                  // swiped right -> previous scene

        if (targetIndex !== currentIndex) {
            scenes[targetIndex].scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
    }, { passive: true });
}

function currentSceneIndex(scenes, experience) {
    const mid = experience.scrollTop + experience.clientHeight / 2;
    let idx = 0;
    for (let i = 0; i < scenes.length; i++) {
        if (scenes[i].offsetTop <= mid) idx = i;
    }
    return idx;
}

/* ============================================================
   PROGRESS THREAD — thin gold line reflecting scroll position.
   Purely reflective: updates from scroll events regardless of
   what caused the scroll (auto-progress, swipe, dots, manual drag).
   ============================================================ */

function setupProgressThread() {
    const experience = document.getElementById('experience');
    const track = document.getElementById('progressThread');
    const fill = document.getElementById('progressFill');
    if (!experience || !track || !fill) return;

    let ticking = false;

    function update() {
        const max = experience.scrollHeight - experience.clientHeight;
        const pct = max > 0 ? Math.min(100, Math.max(0, (experience.scrollTop / max) * 100)) : 0;
        fill.style.height = pct + '%';
        ticking = false;
    }

    experience.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    }, { passive: true });

    update();

    // Fade the thread in once the invitation actually opens — reflecting
    // an experience that isn't visible yet (behind the gate) would be
    // confusing to leave visible.
    const gateButton = document.getElementById('gateButton');
    if (gateButton) {
        gateButton.addEventListener('click', () => {
            track.classList.add('visible');
        }, { once: true });
    }
}

/* ============================================================
   SHIMMER TEXT — gold-foil sweep across headline text
   (pure CSS animation; JS just tags the elements + splits
   hero names into letters for a staggered cascade-in)
   ============================================================ */

function setupShimmerText() {
    // Note: heroGroom/heroBride intentionally excluded — they get letter-split
    // below, and a clipped gradient background doesn't survive being split
    // across child spans, so they rely on solid color + glow instead.
    ['finalNames', 'venueName'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('data-shimmer', '');
    });

    if (prefersReducedMotion) return;

    // Split hero names into individual letters for a cascading reveal
    ['heroGroom', 'heroBride'].forEach(id => {
        const el = document.getElementById(id);
        if (!el || !el.textContent) return;
        const text = el.textContent;
        el.textContent = '';
        el.classList.add('letters-wrap');
        [...text].forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'letter';
            span.style.setProperty('--i', i);
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            el.appendChild(span);
        });
    });
}

/* ============================================================
   PARALLAX — subtle depth on scroll for large photo moments
   ============================================================ */

function setupParallax() {
    if (prefersReducedMotion) return;
    const experience = document.getElementById('experience');
    const targets = document.querySelectorAll('[data-parallax]');
    if (!experience || !targets.length) return;

    let ticking = false;
    function update() {
        const viewportH = experience.clientHeight;
        targets.forEach(el => {
            const rect = el.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const offset = (center - viewportH / 2) / viewportH; // -0.5..0.5 roughly
            el.style.transform = `translateY(${offset * 40}px) scale(1.12)`;
        });
        ticking = false;
    }
    experience.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    update();
}

/* ============================================================
   AMBIENT PARTICLES — canvas layer, themed by `style`
   royal: drifting gold dust | cinematic: falling embers/light
   editorial: geometric confetti drift
   ============================================================ */

function setupAmbientParticles() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return; // context creation can fail on some WebViews — fail silently, no particles rather than a crash
    const style = document.documentElement.getAttribute('data-style') || 'royal';

    let w, h, particles;
    const COUNT = window.innerWidth < 640 ? 26 : 46;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    function makeParticle() {
        const base = { x: Math.random() * w, y: Math.random() * h };
        if (style === 'cinematic') {
            return { ...base, r: Math.random() * 1.8 + 0.6, vy: Math.random() * 0.4 + 0.15, vx: (Math.random() - 0.5) * 0.15, a: Math.random() * 0.5 + 0.2, drift: Math.random() * Math.PI * 2 };
        }
        if (style === 'editorial') {
            return { ...base, r: Math.random() * 3 + 1.5, vy: Math.random() * 0.5 + 0.25, vx: (Math.random() - 0.5) * 0.6, a: Math.random() * 0.6 + 0.3, rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.02 };
        }
        // royal — gentle upward-drifting gold dust
        return { ...base, r: Math.random() * 1.6 + 0.5, vy: -(Math.random() * 0.35 + 0.08), vx: (Math.random() - 0.5) * 0.2, a: Math.random() * 0.55 + 0.15, drift: Math.random() * Math.PI * 2 };
    }

    function initParticles() {
        particles = Array.from({ length: COUNT }, makeParticle);
    }

    function getAccentRGB() {
        const glow = getComputedStyle(document.documentElement).getPropertyValue('--accent-glow').trim();
        return glow || '212,175,55';
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        const rgb = getAccentRGB();
        particles.forEach(p => {
            p.x += p.vx + (p.drift !== undefined ? Math.sin(p.drift + p.y * 0.01) * 0.15 : 0);
            p.y += p.vy;
            if (p.rot !== undefined) p.rot += p.vr;

            if (p.y < -10) p.y = h + 10;
            if (p.y > h + 10) p.y = -10;
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;

            ctx.save();
            ctx.globalAlpha = p.a;
            if (style === 'editorial') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = `rgba(${rgb},1)`;
                ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb},1)`;
                ctx.shadowColor = `rgba(${rgb},.9)`;
                ctx.shadowBlur = style === 'cinematic' ? 4 : 3;
                ctx.fill();
            }
            ctx.restore();
        });
        requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    window.addEventListener('resize', () => { resize(); initParticles(); });
    requestAnimationFrame(draw);
}

/* ============================================================
   DATE FORMATTING (manual — avoids locale field-order quirks)
   ============================================================ */

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatDateLong(date) {
    return MONTH_NAMES[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}
function formatDateDayFirst(date) {
    return date.getDate() + ' ' + MONTH_NAMES[date.getMonth()] + ' ' + date.getFullYear();
}
function formatDateWithWeekday(date) {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return days[date.getDay()] + ', ' + formatDateDayFirst(date);
}

/* ============================================================
   UTIL
   ============================================================ */

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}