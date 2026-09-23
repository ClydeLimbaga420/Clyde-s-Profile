function toggleDarkMode() {
    const isDark = document.body.classList.toggle("darkmode");
    const button = document.getElementById("themeButton");

    if (button) {
        button.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    localStorage.setItem("darkmode", isDark);
}

function toggleMenu() {
    const navMenu = document.getElementById("navMenu");

    if (navMenu) {
        navMenu.classList.toggle("active");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const isDark = localStorage.getItem("darkmode") === "true";
    const button = document.getElementById("themeButton");

    if (isDark) {
        document.body.classList.add("darkmode");
    } else {
        document.body.classList.remove("darkmode");
    }

    if (button) {
        button.innerHTML = isDark
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }

    calculateAge();
    updateBirthdayCountdown();
    setRandomGreeting();

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

    const navLinks = document.querySelectorAll("#navMenu a");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            const navMenu = document.getElementById("navMenu");

            if (navMenu) {
                navMenu.classList.remove("active");
            }
        });
    });
});

emailjs.init({
    publicKey: "km6Tyg98f7Puogtzw"
});

const contactForm = document.getElementById("contactForm");
const sendButton = document.getElementById("send");
const emailToast = document.getElementById("emailToast");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();

        sendButton.disabled = true;

        sendButton.innerHTML = `
            Sending...
            <i class="fas fa-spinner fa-spin"></i>
        `;

        emailjs.sendForm(
            "service_nzw6rqb",
            "template_3qoho3c",
            contactForm
        )
        .then(() => {
            contactForm.reset();

            sendButton.disabled = false;

            sendButton.innerHTML = `
                Send Message
                <i class="fas fa-paper-plane"></i>
            `;

            showEmailToast();
        })
        .catch((error) => {
            console.error("EMAILJS ERROR:", error);

            sendButton.disabled = false;

            sendButton.innerHTML = `
                Send Message
                <i class="fas fa-paper-plane"></i>
            `;

            showEmailError();
        });
    });
}

function showEmailToast() {
    if (!emailToast) return;

    emailToast.classList.remove("error");

    const icon = emailToast.querySelector(".toast-icon");
    const title = emailToast.querySelector(".toast-content strong");
    const message = emailToast.querySelector(".toast-content span");

    if (icon) {
        icon.innerHTML = '<i class="fas fa-check"></i>';
    }

    if (title) {
        title.textContent = "Message Sent!";
    }

    if (message) {
        message.textContent =
            "Thanks for reaching out. I'll get back to you soon.";
    }

    emailToast.classList.add("show");

    setTimeout(() => {
        closeEmailToast();
    }, 5000);
}

function showEmailError() {
    if (!emailToast) {
        return;
    }

    const icon = emailToast.querySelector(".toast-icon");
    const title = emailToast.querySelector(".toast-content strong");
    const message = emailToast.querySelector(".toast-content span");

    emailToast.classList.add("error");
    emailToast.classList.add("show");

    if (icon) {
        icon.innerHTML = '<i class="fas fa-xmark"></i>';
    }

    if (title) {
        title.textContent = "Message Failed";
    }

    if (message) {
        message.textContent =
            "Something went wrong. Please try again.";
    }

    setTimeout(() => {
        closeEmailToast();
    }, 5000);
}

function closeEmailToast() {
    if (!emailToast) return;

    emailToast.classList.remove("show");

    setTimeout(() => {
        const icon = emailToast.querySelector(".toast-icon");
        const title = emailToast.querySelector(".toast-content strong");
        const message = emailToast.querySelector(".toast-content span");

        if (icon) {
            icon.innerHTML = '<i class="fas fa-check"></i>';
        }

        if (title) {
            title.textContent = "Message Sent!";
        }

        if (message) {
            message.textContent =
                "Thanks for reaching out. I'll get back to you soon.";
        }

        emailToast.classList.remove("error");
    }, 400);
}

function calculateAge() {
    const birthDate = new Date("2006-02-18");
    const today = new Date();

    let age =
        today.getFullYear() -
        birthDate.getFullYear();

    const monthDiff =
        today.getMonth() -
        birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (
            monthDiff === 0 &&
            today.getDate() < birthDate.getDate()
        )
    ) {
        age--;
    }

    const ageElement = document.getElementById("age");

    if (ageElement) {
        ageElement.textContent = age;
    }
}

function launchConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div");

        confetti.style.position = "fixed";
        confetti.style.width = "8px";
        confetti.style.height = "8px";

        confetti.style.background =
            `hsl(${Math.random() * 360}, 100%, 50%)`;

        confetti.style.top = "-10px";

        confetti.style.left =
            Math.random() * window.innerWidth + "px";

        confetti.style.opacity = "0.8";
        confetti.style.zIndex = "9999";
        confetti.style.borderRadius = "50%";

        document.body.appendChild(confetti);

        const fall = setInterval(() => {
            confetti.style.top =
                confetti.offsetTop + 5 + "px";

            if (confetti.offsetTop > window.innerHeight) {
                confetti.remove();
                clearInterval(fall);
            }
        }, 20);
    }
}

function updateBirthdayCountdown() {
    const countdown =
        document.getElementById("birthday-countdown");

    if (!countdown) return;

    const today = new Date();

    let nextBirthday = new Date(
        today.getFullYear(),
        1,
        18
    );

    if (today > nextBirthday) {
        nextBirthday = new Date(
            today.getFullYear() + 1,
            1,
            18
        );
    }

    const diff = nextBirthday - today;

    const days = Math.floor(
        diff / (1000 * 60 * 60 * 24)
    );

    const hours = Math.floor(
        (diff / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
        (diff / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
        (diff / 1000) % 60
    );

    if (
        days === 0 &&
        hours === 0 &&
        minutes === 0 &&
        seconds === 0
    ) {
        countdown.textContent =
            "🎉 It's my birthday today! 🎂";

        launchConfetti();
    } else {
        countdown.textContent =
            `${days}d ${hours}h ${minutes}m ${seconds}s until my B-Day 🎂`;
    }
}

setInterval(updateBirthdayCountdown, 1000);

const bgMusic = document.getElementById("bgMusic");
const musicButton = document.getElementById("musicButton");
const musicDisc = document.getElementById("musicDisc");

function toggleMusic() {
    if (!bgMusic || !musicButton || !musicDisc) {
        return;
    }

    if (bgMusic.paused) {
        bgMusic.play();

        musicButton.innerHTML =
            '<i class="fas fa-pause"></i>';

        musicButton.setAttribute(
            "aria-label",
            "Pause music"
        );

        musicDisc.classList.add("playing");
    } else {
        bgMusic.pause();

        musicButton.innerHTML =
            '<i class="fas fa-play"></i>';

        musicButton.setAttribute(
            "aria-label",
            "Play music"
        );

        musicDisc.classList.remove("playing");
    }
}

// SEASONAL PARTICLE EFFECTS
function getSeason(date = new Date()) {
    const month = date.getMonth(); // 0 = Jan
    if (month === 11 || month <= 1) return "winter";
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    return "autumn";
}

const SEASON_CONFIG = {
    winter: { symbols: ["❄", "❅", "❆"], count: 28, minSize: 10, maxSize: 20, minDuration: 8, maxDuration: 16 },
    spring: { symbols: ["🌸", "🌷", "💮"], count: 16, minSize: 14, maxSize: 22, minDuration: 9, maxDuration: 17 },
    autumn: { symbols: ["🍁", "🍂"], count: 18, minSize: 14, maxSize: 24, minDuration: 7, maxDuration: 14 },
    summer: { symbols: ["✨"], count: 14, minSize: 6, maxSize: 12, minDuration: 4, maxDuration: 7, firefly: true }
};

function spawnParticle(config) {
    const el = document.createElement("span");
    const symbol = config.symbols[Math.floor(Math.random() * config.symbols.length)];
    const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
    const duration = config.minDuration + Math.random() * (config.maxDuration - config.minDuration);
    const drift = (Math.random() - 0.5) * 160;

    el.textContent = symbol;
    el.className = config.firefly ? "seasonal-particle particle-firefly" : "seasonal-particle";
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = size + "px";
    el.style.setProperty("--drift", drift + "px");
    el.style.setProperty("--spin", (Math.random() * 360) + "deg");
    el.style.animationDuration = duration + "s";

    if (config.firefly) {
        el.style.top = Math.random() * 90 + "vh";
        el.style.left = Math.random() * 100 + "vw";
        el.style.animationDelay = (Math.random() * 3) + "s";
    }

    document.body.appendChild(el);

    if (!config.firefly) {
        el.addEventListener("animationend", () => el.remove());
    }
}

function startSeasonalEffect() {
    const season = getSeason();
    document.body.classList.toggle("season-summer", season === "summer");

    const config = SEASON_CONFIG[season];
    if (!config) return;

    if (config.firefly) {
        for (let i = 0; i < config.count; i++) spawnParticle(config);
        return;
    }

    // Spawn a burst, then keep spawning on an interval to keep it going
    for (let i = 0; i < config.count / 2; i++) {
        setTimeout(() => spawnParticle(config), Math.random() * 4000);
    }
    setInterval(() => spawnParticle(config), 1200);
}

// RANDOM GREETING ON LOAD
const GREETINGS = [
    "Hi", "Hola", "Bonjour", "Ciao", "Hallo", "Olá",
    "Kumusta", "こんにちは", "안녕하세요", "你好",
    "Salam", "Namaste", "Привет", "Merhaba", "Yassou"
];

function setRandomGreeting() {
    const el = document.getElementById("greetingWord");
    if (!el) return;
    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    el.textContent = greeting;
}

window.addEventListener("DOMContentLoaded", startSeasonalEffect);