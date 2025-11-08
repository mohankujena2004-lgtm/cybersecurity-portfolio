// ================================================
// NAVIGATION AND SECTION SWITCHING
// ================================================
function showSection(event, sectionId) {
  event.preventDefault();

  // Hide all sections and hero
  const allSections = document.querySelectorAll('section, .hero');
  allSections.forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });

  // Remove active class from all nav links
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Show the selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.style.display = 'block';
    setTimeout(() => {
      targetSection.classList.add('active');
    }, 10);
  }

  // Add active class to clicked nav link
  event.target.classList.add('active');

  // Update URL hash
  history.pushState(null, null, `#${sectionId}`);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================
// TYPING EFFECT FOR TAGLINE
// ================================================
const taglines = [
  "Cybersecurity Professional 🛡️",
  "Vulnerability Assessment Expert 🔍",
  "Network Security Specialist 🌐",
  "Digital Forensics Analyst 🔬",
  "Ethical Hacking Enthusiast 💻"
];

let taglineIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeTagline() {
  const taglineElement = document.querySelector('.tagline');
  
  if (!taglineElement) return;

  const currentTagline = taglines[taglineIndex];

  if (isDeleting) {
    taglineElement.textContent = currentTagline.substring(0, charIndex - 1);
    charIndex--;
  } else {
    taglineElement.textContent = currentTagline.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = 100;

  if (isDeleting) {
    typeSpeed = 50;
  }

  if (!isDeleting && charIndex === currentTagline.length) {
    typeSpeed = 2000;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    taglineIndex = (taglineIndex + 1) % taglines.length;
    typeSpeed = 500;
  }

  setTimeout(typeTagline, typeSpeed);
}

// ================================================
// INITIALIZE ON PAGE LOAD
// ================================================
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Page loaded - Navigation initialized');

  // Make home section visible
  const homeSection = document.getElementById('home');
  if (homeSection) {
    homeSection.style.display = 'block';
    homeSection.classList.add('active');
  }

  // Hide all other sections
  const allSections = document.querySelectorAll('section');
  allSections.forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });

  // Start typing effect
  if (document.querySelector('.tagline')) {
    typeTagline();
  }

  // Handle hash navigation on load
  const hash = window.location.hash;
  if (hash && hash !== '#home') {
    const sectionId = hash.substring(1);
    const section = document.getElementById(sectionId);
    if (section) {
      if (homeSection) {
        homeSection.style.display = 'none';
        homeSection.classList.remove('active');
      }
      
      section.style.display = 'block';
      setTimeout(() => {
        section.classList.add('active');
      }, 10);
      
      document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === hash) {
          link.classList.add('active');
        }
      });
    }
  }
});

// ================================================
// HANDLE BROWSER BACK/FORWARD
// ================================================
window.addEventListener('hashchange', function() {
  const hash = window.location.hash || '#home';
  const sectionId = hash.substring(1);
  
  document.querySelectorAll('section, .hero').forEach(section => {
    section.style.display = 'none';
    section.classList.remove('active');
  });
  
  const section = document.getElementById(sectionId);
  if (section) {
    section.style.display = 'block';
    setTimeout(() => {
      section.classList.add('active');
    }, 10);
  }
  
  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    }
  });
});

console.log('✅ Navigation script loaded successfully!');