/* ==================================================
   ITI WEBSITE JAVASCRIPT
   ================================================== */

// Website functionality will be added step by step.
/* =========================
   HOME IMAGE SLIDER
========================= */

let slideIndex = 0;

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

function showSlide(index) {

    if (slides.length === 0) return;

    // Loop back
    if (index >= slides.length) {
        slideIndex = 0;
    }

    // Loop to last
    if (index < 0) {
        slideIndex = slides.length - 1;
    }

    // Hide all slides
    slides.forEach(function(slide) {
        slide.classList.remove("active");
    });

    // Remove active from dots
    dots.forEach(function(dot) {
        dot.classList.remove("active");
    });

    // Show current slide
    slides[slideIndex].classList.add("active");

    // Activate current dot
    if (dots[slideIndex]) {
        dots[slideIndex].classList.add("active");
    }
}


// Next / Previous buttons
function changeSlide(direction) {
    slideIndex = slideIndex + direction;
    showSlide(slideIndex);
}


// Dot buttons
function currentSlide(number) {
    slideIndex = number - 1;
    showSlide(slideIndex);
}


// Start slider
showSlide(slideIndex);


// Automatic slide every 5 seconds
setInterval(function() {
    slideIndex++;
    showSlide(slideIndex);
}, 5000);
/* =========================================================
   WHAT'S NEW - NOTICE SEARCH
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("noticeSearch");
    const searchButton = document.getElementById("noticeSearchBtn");
    const clearButton = document.getElementById("noticeClearBtn");
    const tableBody = document.getElementById("noticeTableBody");
    const noResult = document.getElementById("noticeNoResult");

    if (!searchInput || !searchButton || !clearButton || !tableBody) {
        return;
    }


    function searchNotices() {

        const searchText = searchInput.value
            .trim()
            .toLowerCase();

        const rows = tableBody.querySelectorAll("tr");

        let visibleRows = 0;


        rows.forEach(function (row) {

            const rowText = row.textContent.toLowerCase();

            if (rowText.includes(searchText)) {

                row.style.display = "";
                visibleRows++;

            } else {

                row.style.display = "none";

            }

        });


        if (noResult) {

            if (visibleRows === 0) {
                noResult.style.display = "block";
            } else {
                noResult.style.display = "none";
            }

        }

    }


    /* SEARCH BUTTON */

    searchButton.addEventListener("click", function () {
        searchNotices();
    });


    /* LIVE SEARCH */

    searchInput.addEventListener("input", function () {
        searchNotices();
    });


    /* ENTER KEY */

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            searchNotices();
        }

    });


    /* CLEAR */

    clearButton.addEventListener("click", function () {

        searchInput.value = "";

        const rows = tableBody.querySelectorAll("tr");

        rows.forEach(function (row) {
            row.style.display = "";
        });

        if (noResult) {
            noResult.style.display = "none";
        }

        searchInput.focus();

    });

});

/* =========================================================
   PLACEMENT & JOB UPDATES SEARCH
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const searchInput = document.getElementById("jobSearch");
    const searchButton = document.getElementById("jobSearchBtn");
    const jobList = document.getElementById("jobList");
    const noResult = document.getElementById("jobNoResult");

    if (!searchInput || !searchButton || !jobList) {
        return;
    }


    function searchJobs() {

        const searchText = searchInput.value
            .trim()
            .toLowerCase();

        const jobs = jobList.querySelectorAll(".job-item");

        let visibleJobs = 0;


        jobs.forEach(function (job) {

            const jobText = job.textContent.toLowerCase();

            if (jobText.includes(searchText)) {

                job.style.display = "";

                visibleJobs++;

            } else {

                job.style.display = "none";

            }

        });


        if (noResult) {

            if (visibleJobs === 0) {
                noResult.style.display = "block";
            } else {
                noResult.style.display = "none";
            }

        }

    }


    /* SEARCH BUTTON */

    searchButton.addEventListener("click", function () {
        searchJobs();
    });


    /* LIVE SEARCH */

    searchInput.addEventListener("input", function () {
        searchJobs();
    });


    /* ENTER KEY */

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {
            searchJobs();
        }

    });

});
/* ================= BACK TO TOP BUTTON ================= */

const backToTopButton = document.createElement("button");

backToTopButton.className = "back-to-top-button";
backToTopButton.setAttribute("aria-label", "Back to Top");
backToTopButton.setAttribute("title", "Back to Top");

backToTopButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

document.body.appendChild(backToTopButton);


window.addEventListener("scroll", function () {

    if (window.scrollY > 300) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }

});


backToTopButton.addEventListener("click", function () {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});
/* =========================================================
   MOBILE & TABLET NAVBAR
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const mainNav = document.querySelector(".main-nav");
    const navContainer = document.querySelector(".nav-container");

    if (!mainNav || !navContainer) {
        return;
    }


    /* ================= CREATE HAMBURGER ================= */

    let menuButton = mainNav.querySelector(".mobile-menu-toggle");

    if (!menuButton) {

        menuButton = document.createElement("button");

        menuButton.type = "button";

        menuButton.className = "mobile-menu-toggle";

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;

        mainNav.appendChild(menuButton);
    }


    /* ================= OPEN / CLOSE MENU ================= */

    function closeMobileMenu() {

        mainNav.classList.remove("mobile-menu-open");

        menuButton.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        document
            .querySelectorAll(".nav-dropdown.dropdown-open")
            .forEach(function (dropdown) {

                dropdown.classList.remove("dropdown-open");

            });
    }


    function openMobileMenu() {

        mainNav.classList.add("mobile-menu-open");

        menuButton.classList.add("active");

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    }


    menuButton.addEventListener("click", function (event) {

        event.stopPropagation();

        if (mainNav.classList.contains("mobile-menu-open")) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    });


    /* ================= DROPDOWN CLICK ================= */

    const dropdowns =
        mainNav.querySelectorAll(".nav-dropdown");


    dropdowns.forEach(function (dropdown) {

        const parentLink =
            dropdown.querySelector(":scope > .nav-link");

        if (!parentLink) {
            return;
        }


        parentLink.addEventListener("click", function (event) {

            /* Only mobile/tablet */

            if (window.innerWidth <= 992) {

                event.preventDefault();

                event.stopPropagation();


                const alreadyOpen =
                    dropdown.classList.contains("dropdown-open");


                /* Close other dropdowns */

                dropdowns.forEach(function (otherDropdown) {

                    if (otherDropdown !== dropdown) {

                        otherDropdown.classList.remove(
                            "dropdown-open"
                        );

                    }

                });


                /* Toggle current dropdown */

                if (alreadyOpen) {

                    dropdown.classList.remove(
                        "dropdown-open"
                    );

                } else {

                    dropdown.classList.add(
                        "dropdown-open"
                    );

                }

            }

        });


        /* ================= SUBMENU LINKS ================= */

        const submenuLinks =
            dropdown.querySelectorAll(".dropdown-menu a");


        submenuLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                /*
                 * Actual page selected:
                 * automatically close complete menu
                 */

                if (window.innerWidth <= 992) {

                    closeMobileMenu();

                }

            });

        });

    });


    /* ================= NORMAL NAV LINKS ================= */

    const normalLinks =
        mainNav.querySelectorAll(
            ".nav-container > .nav-link"
        );


    normalLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (window.innerWidth <= 992) {

                closeMobileMenu();

            }

        });

    });


    /* ================= OUTSIDE CLICK ================= */

    document.addEventListener("click", function (event) {

        if (window.innerWidth <= 992) {

            if (
                mainNav.classList.contains("mobile-menu-open") &&
                !mainNav.contains(event.target)
            ) {

                closeMobileMenu();

            }

        }

    });


    /* ================= ESC KEY ================= */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    });


    /* ================= RESIZE ================= */

    window.addEventListener("resize", function () {

        if (window.innerWidth > 992) {

            closeMobileMenu();

        }

    });

});
/* =========================================================
   STUDENT TESTIMONIALS - SMOOTH RESPONSIVE SLIDER
   Desktop : 5 cards
   Tablet  : 3 cards
   Mobile  : 2 cards
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const slider = document.querySelector(".testimonials-slider");
    const track = document.getElementById("testimonialsTrack");
    const dotsContainer = document.getElementById("testimonialsDots");

    if (!slider || !track || !dotsContainer) {
        return;
    }


    const originalCards = Array.from(
        track.querySelectorAll(".testimonial-card")
    );

    const totalCards = originalCards.length;

    if (totalCards < 2) {
        return;
    }


    let visibleCards = 5;
    let currentIndex = 0;
    let cardStep = 0;

    let autoSlideTimer = null;
    let resizeTimer = null;

    let isAnimating = false;


    /* =====================================================
       GET VISIBLE CARD COUNT
       ===================================================== */

    function getVisibleCards() {

        if (window.innerWidth <= 600) {
            return 2;
        }

        if (window.innerWidth <= 1000) {
            return 3;
        }

        return 5;
    }


    /* =====================================================
       GET CARD STEP
       ===================================================== */

    function calculateCardStep() {

        const card = track.querySelector(".testimonial-card");

        if (!card) {
            return;
        }


        const cardWidth =
            card.getBoundingClientRect().width;


        const trackStyle =
            window.getComputedStyle(track);


        const gap =
            parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;


        cardStep = cardWidth + gap;
    }


    /* =====================================================
       CREATE CLONES
       ===================================================== */

    function createClones() {

        track.querySelectorAll(".testimonial-clone")
            .forEach(function (clone) {
                clone.remove();
            });


        /*
         * Clone enough cards to make the
         * continuous transition smooth.
         */

        for (let i = 0; i < visibleCards; i++) {

            const clone =
                originalCards[i % totalCards].cloneNode(true);

            clone.classList.add("testimonial-clone");

            track.appendChild(clone);
        }
    }


    /* =====================================================
       MOVE SLIDER
       ===================================================== */

    function moveSlider(animated) {

        if (!cardStep) {
            return;
        }


        if (animated) {

            track.style.transition =
                "transform 0.75s cubic-bezier(0.22, 0.61, 0.36, 1)";

        } else {

            track.style.transition = "none";
        }


        track.style.transform =
            "translate3d(-" +
            (currentIndex * cardStep) +
            "px, 0, 0)";


        updateDots();
    }


    /* =====================================================
       NEXT SLIDE
       ===================================================== */

    function nextSlide() {

        if (isAnimating) {
            return;
        }


        isAnimating = true;

        currentIndex++;

        moveSlider(true);


        setTimeout(function () {

            /*
             * When the original cards are finished,
             * jump silently back to the beginning.
             */

            if (currentIndex >= totalCards) {

                currentIndex = 0;

                moveSlider(false);

            }


            isAnimating = false;

        }, 800);
    }


    /* =====================================================
       DOTS
       ===================================================== */

    function createDots() {

        dotsContainer.innerHTML = "";


        for (let i = 0; i < totalCards; i++) {

            const dot =
                document.createElement("button");


            dot.type = "button";

            dot.className = "testimonial-dot";

            dot.setAttribute(
                "aria-label",
                "Show testimonial " + (i + 1)
            );


            dot.addEventListener("click", function () {

                stopAutoSlide();


                if (isAnimating) {
                    return;
                }


                isAnimating = true;

                currentIndex = i;

                moveSlider(true);


                setTimeout(function () {
                    isAnimating = false;
                }, 800);


                startAutoSlide();

            });


            dotsContainer.appendChild(dot);
        }


        updateDots();
    }


    /* =====================================================
       UPDATE DOT
       ===================================================== */

    function updateDots() {

        const dots =
            dotsContainer.querySelectorAll(
                ".testimonial-dot"
            );


        if (!dots.length) {
            return;
        }


        const activeIndex =
            currentIndex % totalCards;


        dots.forEach(function (dot, index) {

            dot.classList.toggle(
                "active",
                index === activeIndex
            );

        });

    }


    /* =====================================================
       BUILD / INITIALIZE
       ===================================================== */

    function buildSlider() {

        stopAutoSlide();


        visibleCards = getVisibleCards();


        currentIndex = 0;

        isAnimating = false;


        createClones();


        track.style.transition = "none";

        track.style.transform =
            "translate3d(0, 0, 0)";


        /*
         * Wait for browser layout calculation.
         */

        requestAnimationFrame(function () {

            calculateCardStep();

            moveSlider(false);

            createDots();

            startAutoSlide();

        });

    }


    /* =====================================================
       AUTO PLAY
       ===================================================== */

    function startAutoSlide() {

        stopAutoSlide();


        autoSlideTimer =
            setInterval(function () {

                nextSlide();

            }, 4500);

    }


    function stopAutoSlide() {

        if (autoSlideTimer !== null) {

            clearInterval(autoSlideTimer);

            autoSlideTimer = null;

        }

    }


    /* =====================================================
       PAUSE ON HOVER
       ===================================================== */

    slider.addEventListener(
        "mouseenter",
        function () {

            stopAutoSlide();

        }
    );


    slider.addEventListener(
        "mouseleave",
        function () {

            startAutoSlide();

        }
    );


    /* =====================================================
       TOUCH SWIPE
       ===================================================== */

    let touchStartX = 0;
    let touchEndX = 0;


    slider.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

            stopAutoSlide();

        },
        { passive: true }
    );


    slider.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;


            const swipeDistance =
                touchStartX - touchEndX;


            if (Math.abs(swipeDistance) > 45) {

                if (swipeDistance > 0) {

                    nextSlide();

                } else {

                    /*
                     * Previous slide
                     */

                    if (!isAnimating) {

                        isAnimating = true;

                        currentIndex--;

                        if (currentIndex < 0) {
                            currentIndex =
                                totalCards - 1;
                        }

                        moveSlider(true);


                        setTimeout(function () {

                            isAnimating = false;

                        }, 800);

                    }

                }

            }


            startAutoSlide();

        },
        { passive: true }
    );


    /* =====================================================
       RESIZE
       ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            clearTimeout(resizeTimer);


            resizeTimer =
                setTimeout(function () {

                    buildSlider();

                }, 250);

        }
    );


    /* =====================================================
       START
       ===================================================== */

    buildSlider();

});
/* =========================================================
   INSTITUTE DASHBOARD - ONE TIME COUNTER ANIMATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const dashboard =
        document.getElementById("instituteDashboard");

    if (!dashboard) {
        return;
    }


    const numberElements =
        dashboard.querySelectorAll(".dashboard-number");

    if (!numberElements.length) {
        return;
    }


    let animationPlayed = false;


    /* =====================================================
       ANIMATE NUMBER
       ===================================================== */

    function animateNumber(element) {

        const target =
            Number(element.getAttribute("data-value"));


        const suffix =
            element.getAttribute("data-suffix") || "";


        /*
         * Invalid values ko safely handle karo.
         */

        if (!Number.isFinite(target) || target < 0) {

            element.textContent =
                "0" + suffix;

            return;
        }


        /*
         * Already zero hone par bhi final value
         * properly display hogi.
         */

        if (target === 0) {

            element.textContent =
                "0" + suffix;

            return;
        }


        const duration = 1600;

        const startTime = performance.now();


        function updateNumber(currentTime) {

            const elapsed =
                currentTime - startTime;


            const progress =
                Math.min(elapsed / duration, 1);


            /*
             * Ease-out effect:
             * Starting fast, ending smoothly.
             */

            const easedProgress =
                1 - Math.pow(1 - progress, 3);


            const currentValue =
                Math.floor(
                    target * easedProgress
                );


            element.textContent =
                currentValue.toLocaleString("en-IN") +
                suffix;


            if (progress < 1) {

                requestAnimationFrame(
                    updateNumber
                );

            } else {

                /*
                 * Exact final value.
                 */

                element.textContent =
                    target.toLocaleString("en-IN") +
                    suffix;
            }

        }


        requestAnimationFrame(updateNumber);

    }


    /* =====================================================
       START ANIMATION ONLY ONCE
       ===================================================== */

    function startDashboardAnimation() {

        if (animationPlayed) {
            return;
        }


        animationPlayed = true;


        numberElements.forEach(
            function (element) {

                animateNumber(element);

            }
        );

    }


    /* =====================================================
       INTERSECTION OBSERVER
       ===================================================== */

    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting &&
                                !animationPlayed
                            ) {

                                startDashboardAnimation();

                                /*
                                 * Section mil gaya,
                                 * observer ki zarurat nahi.
                                 */

                                observer.unobserve(
                                    dashboard
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.25
                }
            );


        observer.observe(dashboard);


    } else {

        /*
         * Older browsers ke liye fallback.
         */

        startDashboardAnimation();

    }

});
/* =========================================================
   OUR RECRUITERS - SMOOTH AUTO SLIDER
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const slider =
        document.querySelector(".recruiters-slider");

    const track =
        document.getElementById("recruitersTrack");


    if (!slider || !track) {
        return;
    }


    const originalCards =
        Array.from(
            track.querySelectorAll(".recruiter-card")
        );


    if (originalCards.length < 2) {
        return;
    }


    let animationFrame = null;

    let position = 0;

    let lastTime = 0;

    let isPaused = false;

    let loopWidth = 0;


    /* =====================================================
       CREATE DUPLICATE SET
       ===================================================== */

    function createClones() {

        track.querySelectorAll(".recruiter-clone")
            .forEach(function (clone) {
                clone.remove();
            });


        originalCards.forEach(function (card) {

            const clone =
                card.cloneNode(true);

            clone.classList.add(
                "recruiter-clone"
            );

            track.appendChild(clone);

        });

    }


    /* =====================================================
       CALCULATE LOOP WIDTH
       ===================================================== */

    function calculateLoopWidth() {

        const firstClone =
            track.querySelector(".recruiter-clone");


        if (!firstClone) {
            return;
        }


        loopWidth =
            firstClone.offsetLeft;


        if (loopWidth <= 0) {

            const card =
                originalCards[0];

            const cardWidth =
                card.getBoundingClientRect().width;


            const styles =
                window.getComputedStyle(track);


            const gap =
                parseFloat(styles.gap) || 0;


            loopWidth =
                (cardWidth + gap) *
                originalCards.length;

        }

    }


    /* =====================================================
       ANIMATION
       ===================================================== */

    function animate(timestamp) {

        if (!lastTime) {
            lastTime = timestamp;
        }


        const delta =
            Math.min(
                timestamp - lastTime,
                50
            );


        lastTime = timestamp;


        if (!isPaused && loopWidth > 0) {

            /*
             * Speed: pixels per second
             * Higher = faster.
             */

            const speed = 55;


            position +=
                (speed * delta) / 1000;


            if (position >= loopWidth) {

                position -= loopWidth;

            }


            track.style.transform =
                "translate3d(-" +
                position +
                "px, 0, 0)";

        }


        animationFrame =
            requestAnimationFrame(
                animate
            );

    }


    /* =====================================================
       PAUSE ON HOVER
       ===================================================== */

    slider.addEventListener(
        "mouseenter",
        function () {

            isPaused = true;

        }
    );


    slider.addEventListener(
        "mouseleave",
        function () {

            isPaused = false;

            lastTime = performance.now();

        }
    );


    /* =====================================================
       RESIZE
       ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(resizeTimer);


            resizeTimer =
                setTimeout(function () {

                    calculateLoopWidth();

                }, 150);

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    createClones();

    requestAnimationFrame(function () {

        calculateLoopWidth();

        animationFrame =
            requestAnimationFrame(
                animate
            );

    });


    /* =====================================================
       CLEANUP
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        function () {

            if (animationFrame) {

                cancelAnimationFrame(
                    animationFrame
                );

            }

        }
    );

});
/* =========================================================
   LATEST UPDATES + HERO SLIDER
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       LATEST UPDATES TICKER
       ===================================================== */

    const updatesTrack =
        document.getElementById("latestUpdatesTrack");


    if (updatesTrack) {

        const originalContent =
            updatesTrack.innerHTML;

        updatesTrack.innerHTML =
            originalContent +
            '<span class="update-dot">•</span>' +
            originalContent;

    }


    /* =====================================================
       HERO SLIDER
       ===================================================== */

    const heroSlider =
        document.getElementById("heroSlider");


    if (!heroSlider) {
        return;
    }


    const slides =
        heroSlider.querySelectorAll(".hero-slide");


    const prevButton =
        document.getElementById("heroPrev");


    const nextButton =
        document.getElementById("heroNext");


    const dotsContainer =
        document.getElementById("heroDots");


    if (
        slides.length === 0 ||
        !dotsContainer
    ) {
        return;
    }


    let currentSlide = 0;

    let autoSlideTimer = null;

    let isAnimating = false;


    /* =====================================================
       CREATE DOTS
       ===================================================== */

    slides.forEach(function (slide, index) {

        const dot =
            document.createElement("button");


        dot.type = "button";

        dot.className = "hero-dot";


        dot.setAttribute(
            "aria-label",
            "Show image " + (index + 1)
        );


        dot.addEventListener(
            "click",
            function () {

                if (index === currentSlide) {
                    return;
                }


                stopHeroAutoSlide();

                showSlide(index);

                startHeroAutoSlide();

            }
        );


        dotsContainer.appendChild(dot);

    });


    const dots =
        dotsContainer.querySelectorAll(".hero-dot");


    /* =====================================================
       SHOW SLIDE
       ===================================================== */

    function showSlide(index) {

        if (isAnimating) {
            return;
        }


        if (index < 0) {
            index = slides.length - 1;
        }


        if (index >= slides.length) {
            index = 0;
        }


        isAnimating = true;


        slides.forEach(function (slide, i) {

            slide.classList.toggle(
                "active",
                i === index
            );

        });


        dots.forEach(function (dot, i) {

            dot.classList.toggle(
                "active",
                i === index
            );

        });


        currentSlide = index;


        setTimeout(function () {

            isAnimating = false;

        }, 950);

    }


    /* =====================================================
       NEXT
       ===================================================== */

    function nextSlide() {

        if (isAnimating) {
            return;
        }


        showSlide(
            (currentSlide + 1) % slides.length
        );

    }


    /* =====================================================
       PREVIOUS
       ===================================================== */

    function previousSlide() {

        if (isAnimating) {
            return;
        }


        let previousIndex =
            currentSlide - 1;


        if (previousIndex < 0) {
            previousIndex =
                slides.length - 1;
        }


        showSlide(previousIndex);

    }


    /* =====================================================
       BUTTONS
       ===================================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                stopHeroAutoSlide();

                nextSlide();

                startHeroAutoSlide();

            }
        );

    }


    if (prevButton) {

        prevButton.addEventListener(
            "click",
            function () {

                stopHeroAutoSlide();

                previousSlide();

                startHeroAutoSlide();

            }
        );

    }


    /* =====================================================
       AUTO SLIDE
       ===================================================== */

    function startHeroAutoSlide() {

        stopHeroAutoSlide();


        autoSlideTimer =
            setInterval(
                function () {

                    nextSlide();

                },
                4000
            );

    }


    function stopHeroAutoSlide() {

        if (autoSlideTimer !== null) {

            clearInterval(autoSlideTimer);

            autoSlideTimer = null;

        }

    }


    /* =====================================================
       PAUSE ON MOUSE
       ===================================================== */

    heroSlider.addEventListener(
        "mouseenter",
        function () {

            stopHeroAutoSlide();

        }
    );


    heroSlider.addEventListener(
        "mouseleave",
        function () {

            startHeroAutoSlide();

        }
    );


    /* =====================================================
       MOBILE SWIPE
       ===================================================== */

    let touchStartX = 0;

    let touchEndX = 0;


    heroSlider.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

            stopHeroAutoSlide();

        },
        {
            passive: true
        }
    );


    heroSlider.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;


            const distance =
                touchStartX - touchEndX;


            if (Math.abs(distance) > 50) {

                if (distance > 0) {

                    nextSlide();

                } else {

                    previousSlide();

                }

            }


            startHeroAutoSlide();

        },
        {
            passive: true
        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    showSlide(0);

    startHeroAutoSlide();

});
document.querySelectorAll('.document-card input[type="file"]').forEach(function(input) {

    input.addEventListener('change', function() {

        const nameElement = document.getElementById(input.id + 'Name');

        if (!nameElement) return;

        if (input.files.length === 0) {
            nameElement.textContent = "No file chosen";
        } 
        else if (input.multiple) {
            nameElement.textContent = input.files.length + " files selected";
        } 
        else {
            nameElement.textContent = input.files[0].name;
        }

    });

});
document.addEventListener("DOMContentLoaded", function () {

    const documentInputs = document.querySelectorAll(
        '.document-item input[type="file"]'
    );

    documentInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            const nameBox = document.getElementById(
                input.id + "Name"
            );

            if (!nameBox) {
                console.log("Name box not found for:", input.id);
                return;
            }

            /* No file */
            if (input.files.length === 0) {

                nameBox.textContent = input.multiple
                    ? "No files chosen"
                    : "No file chosen";

                return;
            }

            /* Multiple files */
            if (input.multiple) {

                let names = [];

                for (let i = 0; i < input.files.length; i++) {
                    names.push(input.files[i].name);
                }

                nameBox.textContent = names.join(", ");

            }

            /* Single file */
            else {

                nameBox.textContent =
                    input.files[0].name;

            }

        });

    });


    /* ================= UPLOAD BUTTON ================= */

    const uploadButton =
        document.getElementById("uploadAllBtn");

    const uploadStatus =
        document.getElementById("uploadStatus");


    if (uploadButton) {

        uploadButton.addEventListener("click", function () {

            let totalFiles = 0;

            documentInputs.forEach(function (input) {
                totalFiles += input.files.length;
            });

            if (totalFiles === 0) {

                if (uploadStatus) {
                    uploadStatus.textContent =
                        "Please select at least one document.";
                }

                return;
            }

            if (uploadStatus) {
                uploadStatus.textContent =
                    totalFiles + " file(s) selected.";
            }

        });

    }

});
/* =========================================
   VIDEO GALLERY - ONE BY ONE AUTOPLAY
========================================= */

let videoPlayers = [];

function onYouTubeIframeAPIReady() {

    const iframes = document.querySelectorAll(".video-frame iframe");

    if (!iframes.length) return;

    iframes.forEach(function (iframe, index) {

        videoPlayers[index] = new YT.Player(iframe, {

            events: {

                onReady: function (event) {

                    // Sirf first video automatically start
                    if (index === 0) {
                        event.target.mute();
                        event.target.playVideo();
                    }

                },

                onStateChange: function (event) {

                    // Video complete hone par next video
                    if (event.data === YT.PlayerState.ENDED) {

                        const nextPlayer = videoPlayers[index + 1];

                        if (nextPlayer) {
                            nextPlayer.mute();
                            nextPlayer.playVideo();
                        }

                    }

                }

            }

        });

    });
}


/* YouTube API load karo */
(function () {

    const iframes = document.querySelectorAll(".video-frame iframe");

    if (!iframes.length) return;

    if (!window.YT) {

        const tag = document.createElement("script");

        tag.src = "https://www.youtube.com/iframe_api";

        document.head.appendChild(tag);

    }

})();

/*gallery hower*/

document.addEventListener("DOMContentLoaded", function () {

    const galleryItems = document.querySelectorAll(".photo-gallery-item");

    galleryItems.forEach(function (item) {

        item.addEventListener("mouseenter", function () {
            this.classList.add("smooth-hover");
        });

        item.addEventListener("mouseleave", function () {
            this.classList.remove("smooth-hover");
        });

    });

});

/* =========================================================
   WEBSITE UNDER WORKING POPUP
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const popup = document.getElementById("underWorkingPopup");
    const closeBtn = document.getElementById("underWorkingClose");
    const continueBtn = document.getElementById("underWorkingContinue");

    if (!popup) return;


    function closeUnderWorkingPopup() {
        popup.style.display = "none";
        document.body.style.overflow = "";
    }


    // Popup show
    popup.style.display = "flex";
    document.body.style.overflow = "hidden";


    // Close button
    if (closeBtn) {
        closeBtn.addEventListener("click", closeUnderWorkingPopup);
    }


    // Continue button
    if (continueBtn) {
        continueBtn.addEventListener("click", closeUnderWorkingPopup);
    }


    // Overlay par click karne par close
    popup.addEventListener("click", function (event) {

        if (event.target === popup) {
            closeUnderWorkingPopup();
        }

    });


    // ESC key se close
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeUnderWorkingPopup();
        }

    });

});
/* =========================================================
   OUR SUCCESS STORIES SLIDER
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const slider =
        document.getElementById("successStoriesSlider");

    const track =
        document.getElementById("successStoriesTrack");

    const prevButton =
        document.getElementById("successPrev");

    const nextButton =
        document.getElementById("successNext");

    const dotsContainer =
        document.getElementById("successSliderDots");


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (
        !slider ||
        !track ||
        !prevButton ||
        !nextButton ||
        !dotsContainer
    ) {
        return;
    }


    let currentPage = 0;


    /* =====================================================
       GET ALL CARDS
       ===================================================== */

    function getCards() {

        return Array.from(
            track.querySelectorAll(
                ".success-story-card"
            )
        );

    }


    /* =====================================================
       CARDS PER PAGE
       
       DESKTOP = 3
       TABLET  = 3
       MOBILE  = 2
       ===================================================== */

    function getCardsPerPage() {

        if (window.innerWidth <= 700) {
            return 2;
        }

        return 3;
    }


    /* =====================================================
       SET EXACT CARD WIDTH
       
       This is the important part.
       Card width is calculated from the ACTUAL
       visible slider width.
       ===================================================== */

    function setCardWidths() {

        const cards =
            getCards();

        if (cards.length === 0) {
            return;
        }


        const cardsPerPage =
            getCardsPerPage();


        const sliderWidth =
            slider.getBoundingClientRect().width;


        const trackStyle =
            window.getComputedStyle(track);


        const gap =
            parseFloat(trackStyle.gap) || 0;


        /*
         * Example desktop:
         *
         * slider = 1200px
         * gap = 24px
         *
         * 3 cards:
         *
         * (1200 - 48) / 3
         *
         * = 384px each
         */

        const cardWidth =
            (
                sliderWidth -
                (
                    gap *
                    (cardsPerPage - 1)
                )
            ) /
            cardsPerPage;


        cards.forEach(
            function (card) {

                card.style.flex =
                    "0 0 " +
                    cardWidth +
                    "px";

                card.style.width =
                    cardWidth +
                    "px";

            }
        );

    }


    /* =====================================================
       TOTAL PAGES
       ===================================================== */

    function getTotalPages() {

        const cards =
            getCards();


        const cardsPerPage =
            getCardsPerPage();


        if (cards.length === 0) {
            return 0;
        }


        return Math.ceil(
            cards.length /
            cardsPerPage
        );

    }


    /* =====================================================
       CREATE DOTS
       ===================================================== */

    function createDots() {

        dotsContainer.innerHTML = "";


        const totalPages =
            getTotalPages();


        /*
         * If only one page,
         * no dots are required.
         */

        if (totalPages <= 1) {

            dotsContainer.style.display =
                "none";

            return;
        }


        dotsContainer.style.display =
            "flex";


        for (
            let i = 0;
            i < totalPages;
            i++
        ) {

            const dot =
                document.createElement(
                    "button"
                );


            dot.type = "button";

            dot.className =
                "success-slider-dot";


            dot.setAttribute(
                "aria-label",
                "Go to success stories slide " +
                (i + 1)
            );


            dot.addEventListener(
                "click",
                function () {

                    currentPage = i;

                    updateSlider();

                }
            );


            dotsContainer.appendChild(
                dot
            );

        }

    }


    /* =====================================================
       UPDATE SLIDER
       ===================================================== */

    function updateSlider() {

        const totalPages =
            getTotalPages();


        if (totalPages <= 0) {
            return;
        }


        /*
         * Keep current page valid.
         */

        if (
            currentPage >= totalPages
        ) {

            currentPage =
                totalPages - 1;

        }


        if (
            currentPage < 0
        ) {

            currentPage = 0;

        }


        /*
         * Move exactly one viewport.
         *
         * Page 0:
         * Card 1 + Card 2 + Card 3
         *
         * Page 1:
         * Card 4 + Card 5 + Card 6
         */

        const sliderWidth =
            slider.getBoundingClientRect().width;


        track.style.transform =
            "translate3d(" +
            (
                -(currentPage * sliderWidth)
            ) +
            "px, 0, 0)";


        /* =================================================
           ACTIVE DOT
           ================================================= */

        const dots =
            dotsContainer.querySelectorAll(
                ".success-slider-dot"
            );


        dots.forEach(
            function (dot, index) {

                dot.classList.toggle(
                    "active",
                    index === currentPage
                );

            }
        );


        /* =================================================
           BUTTON STATES
           ================================================= */

        prevButton.disabled =
            currentPage === 0;


        nextButton.disabled =
            currentPage ===
            totalPages - 1;

    }


    /* =====================================================
       NEXT BUTTON
       ===================================================== */

    nextButton.addEventListener(
        "click",
        function () {

            const totalPages =
                getTotalPages();


            if (
                currentPage <
                totalPages - 1
            ) {

                currentPage++;

                updateSlider();

            }

        }
    );


    /* =====================================================
       PREVIOUS BUTTON
       ===================================================== */

    prevButton.addEventListener(
        "click",
        function () {

            if (
                currentPage > 0
            ) {

                currentPage--;

                updateSlider();

            }

        }
    );


    /* =====================================================
       TOUCH SWIPE
       ===================================================== */

    let touchStartX = 0;

    let touchEndX = 0;


    slider.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

        },
        {
            passive: true
        }
    );


    slider.addEventListener(
        "touchend",
        function (event) {

            touchEndX =
                event.changedTouches[0].clientX;


            const difference =
                touchStartX -
                touchEndX;


            /*
             * Swipe left
             */

            if (
                difference > 50
            ) {

                const totalPages =
                    getTotalPages();


                if (
                    currentPage <
                    totalPages - 1
                ) {

                    currentPage++;

                    updateSlider();

                }

            }


            /*
             * Swipe right
             */

            if (
                difference < -50
            ) {

                if (
                    currentPage > 0
                ) {

                    currentPage--;

                    updateSlider();

                }

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       RESIZE
       ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        function () {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function () {

                        /*
                         * Recalculate card width
                         */

                        setCardWidths();


                        /*
                         * Recalculate dots
                         */

                        createDots();


                        /*
                         * Reposition slider
                         */

                        updateSlider();

                    },
                    150
                );

        }
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    setCardWidths();

    createDots();

    updateSlider();

});
/* =========================================================
   FEEDBACK THANK YOU POPUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const feedbackForm = document.getElementById("feedbackForm");
    const feedbackPopup = document.getElementById("feedbackThankYouPopup");

    if (!feedbackForm || !feedbackPopup) {
        return;
    }

    feedbackForm.addEventListener("submit", function (event) {

        event.preventDefault();
        event.stopPropagation();

        /* Prevent page from jumping */
        const currentScrollPosition = window.scrollY;

        /* Show popup */
        feedbackPopup.classList.add("show");

        /* Keep current page position */
        window.scrollTo(0, currentScrollPosition);

        /* Reset form */
        feedbackForm.reset();

        /* Close after exactly 3 seconds */
        setTimeout(function () {

            feedbackPopup.classList.remove("show");

            window.scrollTo(0, currentScrollPosition);

        }, 3000);

    });

});