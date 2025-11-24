function toggleDarkMode() {
    const isDark = document.body.classList.toggle('darkmode');
    
    const img = document.getElementById('profiledark');
    
    if (isDark) {
        img.src = 'ProfileButDark.jpg';
    } else {
        img.src = 'Profile.jpg';
    }
    localStorage.setItem('darkmode', isDark);
}

window.onload = function () {
    const isDark = localStorage.getItem('darkmode') === 'true';
    if (isDark) {
        document.body.classList.add('darkmode');
        document.getElementById('profiledark').src = 'ProfileButDark.jpg';
    } else {
        document.getElementById('profiledark').src = 'Profile.jpg';
    }
};

emailjs.init('km6Tyg98f7Puogtzw');

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact');
    const sendButton = document.getElementById('send');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        sendButton.classList.add('jiggle-animation');
        setTimeout(() => {
            sendButton.classList.remove('jiggle-animation');
        }, 400);

        
        emailjs.sendForm('service_nzw6rqb', 'template_3qoho3c', form)
        .then(function () {
            alert('Message Sent!');
            form.reset();
        }, function (error) {
            alert('Failed to Send Message.');
            console.error('EmailJS error:', error);
        });
    });

    const darkModeButton = document.getElementById('button');
    darkModeButton.addEventListener('click', function() {
        darkModeButton.classList.add('jiggle-animation');
    }, 400);
    
    const sections = document.querySelectorAll('.personal, .education, .accomplishments, .likes, .prog, .acclinks, .contact-form');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
      observer.observe(section);
    });
    
});

function handleParallax() {
    const profileImg = document.getElementById('profiledark');
    if (!profileImg) return;
    const scrollPosition = window.scrollY;
    const movement = scrollPosition / 5;
    profileImg.style.transform = `translateY(${movement}px)`;
}

window.addEventListener('scroll', handleParallax);

