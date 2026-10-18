// Form Validation
(() => {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')

    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }

            form.classList.add('was-validated')
        }, false)
    })
})()

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Image Lazy Loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }

    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Price Calculator for Booking
const checkInInput = document.querySelector('input[name="checkIn"]');
const checkOutInput = document.querySelector('input[name="checkOut"]');
const totalElement = document.querySelector('.booking-total span:last-child');

if (checkInInput && checkOutInput && totalElement) {
    const calculateTotal = () => {
        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);

        if (checkIn && checkOut && checkOut > checkIn) {
            const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const pricePerNight = parseInt(totalElement.textContent.replace(/[₹,]/g, ''));
            const total = nights * pricePerNight;

            totalElement.textContent = `₹${total.toLocaleString("en-IN")}`;

            // Show breakdown
            const breakdown = document.querySelector('.price-breakdown');
            if (breakdown) {
                breakdown.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>₹${pricePerNight.toLocaleString("en-IN")} x ${nights} nights</span>
            <span>₹${total.toLocaleString("en-IN")}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Service fee</span>
            <span>₹${Math.round(total * 0.1).toLocaleString("en-IN")}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Taxes</span>
            <span>₹${Math.round(total * 0.18).toLocaleString("en-IN")}</span>
          </div>
        `;
            }
        }
    };

    checkInInput.addEventListener('change', calculateTotal);
    checkOutInput.addEventListener('change', calculateTotal);
}

// Image Gallery Lightbox
const galleryImages = document.querySelectorAll('.show-img-gallery img');

if (galleryImages.length > 0) {
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            createLightbox(img.src, index);
        });
    });
}

function createLightbox(src, currentIndex) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
    <div class="lightbox-content">
      <span class="lightbox-close">&times;</span>
      <img src="${src}" alt="Gallery image">
      <div class="lightbox-nav">
        <button class="lightbox-prev">&#10094;</button>
        <button class="lightbox-next">&#10095;</button>
      </div>
    </div>
  `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Close lightbox
    lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
        document.body.removeChild(lightbox);
        document.body.style.overflow = 'auto';
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            document.body.removeChild(lightbox);
            document.body.style.overflow = 'auto';
        }
    });
}

// Add lightbox styles dynamically
const lightboxStyles = document.createElement('style');
lightboxStyles.textContent = `
  .lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }
  
  .lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .lightbox-content img {
    max-width: 100%;
    max-height: 90vh;
    border-radius: 8px;
  }
  
  .lightbox-close {
    position: absolute;
    top: -40px;
    right: 0;
    color: white;
    font-size: 40px;
    font-weight: 300;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .lightbox-close:hover {
    transform: scale(1.2);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(lightboxStyles);

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Toast styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
  }
  
  .toast-notification.show {
    transform: translateX(0);
  }
  
  .toast-success {
    border-left: 4px solid #00A699;
  }
  
  .toast-error {
    border-left: 4px solid #FF385C;
  }
`;
document.head.appendChild(toastStyles);

// Export for use in other scripts
window.showToast = showToast;

console.log('✨ Elite Passage enhanced scripts loaded!');