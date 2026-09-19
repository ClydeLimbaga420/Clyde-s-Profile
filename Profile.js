function updateProfilePhoto(isDark) {
    const profileImg = document.getElementById("profiledark");

    if (!profileImg) return;

    profileImg.src = isDark
        ? "./ProfileButDark.jpg"
        : "./profile.jpg";
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle("darkmode");
    const button = document.getElementById("button");

    button.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    updateProfilePhoto(isDark);
    localStorage.setItem("darkmode", isDark);
}

window.addEventListener("DOMContentLoaded", () => {
    const isDark = localStorage.getItem("darkmode") === "true";
    const button = document.getElementById("button");

    if (isDark) {
        document.body.classList.add("darkmode");
    } else {
        document.body.classList.remove("darkmode");
    }

    button.innerHTML = isDark
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    updateProfilePhoto(isDark);

    calculateAge();
    updateBirthdayCountdown();
});

emailjs.init("km6Tyg98f7Puogtzw");

document.getElementById("contact").addEventListener("submit", function (e) {
    e.preventDefault();

    const btn = document.getElementById("send");
    btn.innerText = "Sending...";

    emailjs.sendForm("service_nzw6rqb", "template_3qoho3c", this)
        .then(() => {
            alert("Message Sent!");
            this.reset();
            btn.innerText = "Send Message";
        })
        .catch(() => {
            alert("Failed to send.");
            btn.innerText = "Send Message";
        });
});

function calculateAge() {
    const birthDate = new Date("2006-02-18");
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    document.getElementById("age").textContent = age;
}

function launchConfetti() {
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement("div");

        confetti.style.position = "fixed";
        confetti.style.width = "8px";
        confetti.style.height = "8px";
        confetti.style.background = `hsl(${Math.random() * 360},100%,50%)`;
        confetti.style.top = "-10px";
        confetti.style.left = Math.random() * window.innerWidth + "px";
        confetti.style.opacity = "0.8";
        confetti.style.zIndex = "9999";
        confetti.style.borderRadius = "50%";

        document.body.appendChild(confetti);

        const fall = setInterval(() => {
            confetti.style.top = confetti.offsetTop + 5 + "px";

            if (confetti.offsetTop > window.innerHeight) {
                confetti.remove();
                clearInterval(fall);
            }
        }, 20);
    }
}

function updateBirthdayCountdown() {
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

    let countdownText;

    if (
        days === 0 &&
        hours === 0 &&
        minutes === 0 &&
        seconds === 0
    ) {
        countdownText = "🎉 It's my birthday today! 🎂";
        launchConfetti();
    } else {
        countdownText =
            `${days}d ${hours}h ${minutes}m ${seconds}s until my B-Day 🎂`;
    }

    document.getElementById(
        "birthday-countdown"
    ).textContent = countdownText;
}

setInterval(updateBirthdayCountdown, 1000);

const bgMusic = document.getElementById("bgMusic");
const musicButton = document.getElementById("musicButton");
const musicDisc = document.getElementById("musicDisc");

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
        musicButton.innerHTML =
            '<i class="fas fa-pause"></i>';
        musicDisc.classList.add("playing");
    } else {
        bgMusic.pause();
        musicButton.innerHTML =
            '<i class="fas fa-play"></i>';
        musicDisc.classList.remove("playing");
    }
}