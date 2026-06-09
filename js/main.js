/* ============================================================
   Corvaxis — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ----- Mobile Hamburger Toggle ----- */
  const toggleBtn = document.querySelector('.navbar-toggle');
  const mobileNav = document.querySelector('.navbar-mobile');

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
      this.setAttribute('aria-expanded', expanded);
      mobileNav.classList.toggle('open');
      document.body.style.overflow = expanded ? 'hidden' : '';
    });

    // Close mobile nav on link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ----- Active Nav Link Highlighting ----- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-links a, .navbar-mobile a');

  function updateActiveLink() {
    let current = '';
    sections.forEach(function (section) {
      const top = section.offsetTop - 120;
      const bottom = top + section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < bottom) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', updateActiveLink, { passive: true });
    window.addEventListener('resize', updateActiveLink, { passive: true });
    updateActiveLink();
  }

  /* ----- Scroll Reveal Animations ----- */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ----- Contact Form Handling ----- */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const formStatus = document.getElementById('form-status');
    const fields = {
      name: document.getElementById('name'),
      email: document.getElementById('email'),
      company: document.getElementById('company'),
      message: document.getElementById('message'),
    };

    // Real-time validation on blur
    Object.keys(fields).forEach(function (key) {
      const field = fields[key];
      if (field) {
        field.addEventListener('blur', function () {
          validateField(key);
        });
        field.addEventListener('input', function () {
          // Clear error while typing
          const group = field.closest('.form-group');
          if (group) {
            group.classList.remove('invalid');
          }
        });
      }
    });

    function validateField(name) {
      const field = fields[name];
      const group = field ? field.closest('.form-group') : null;
      if (!field || !group) return true;

      const value = field.value.trim();

      if (name === 'name' && value.length < 2) {
        group.classList.add('invalid');
        return false;
      }

      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          group.classList.add('invalid');
          return false;
        }
      }

      if (name === 'message' && value.length < 10) {
        group.classList.add('invalid');
        return false;
      }

      group.classList.remove('invalid');
      return true;
    }

    function validateAll() {
      let valid = true;
      Object.keys(fields).forEach(function (key) {
        if (!validateField(key)) {
          valid = false;
        }
      });
      return valid;
    }

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Reset status
      if (formStatus) {
        formStatus.className = 'form-status';
        formStatus.style.display = 'none';
      }

      if (!validateAll()) {
        // Focus the first invalid field
        const firstInvalid = contactForm.querySelector('.form-group.invalid input, .form-group.invalid textarea');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Disable button while submitting
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Collect form data
      const formData = new FormData(contactForm);

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
        .then(function (res) {
          if (!res.ok) throw new Error('Server error');
          return res.json();
        })
        .then(function (data) {
          if (data.success) {
            if (formStatus) {
              formStatus.className = 'form-status success';
              formStatus.textContent = 'Thank you! Your message has been sent. We will get back to you shortly.';
              formStatus.style.display = 'block';
            }
            contactForm.reset();
          } else {
            throw new Error(data.message || 'Submission failed');
          }
        })
        .catch(function () {
          if (formStatus) {
            formStatus.className = 'form-status error';
            formStatus.textContent = 'Something went wrong. Please email us directly at hello@corvaxis.co.uk.';
            formStatus.style.display = 'block';
          }
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
          }
        });
    });
  }

  /* ----- Dynamic Footer Year ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ----- Dynamic Privacy Year ----- */
  const privacyYearEl = document.getElementById('privacy-year');
  if (privacyYearEl) {
    privacyYearEl.textContent = new Date().getFullYear();
  }
})();
