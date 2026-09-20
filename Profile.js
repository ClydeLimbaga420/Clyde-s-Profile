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

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }
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
        message.textContent = "Something went wrong. Please try again.";
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