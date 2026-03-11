// Wait for DOM to be ready before running scripts
document.addEventListener('DOMContentLoaded', function() {

  console.log('DOM loaded, fetching header...');

  // Fetch header from .inc file (use absolute path from root)
  fetch('/html/header.inc')
    .then(response => {
      if (!response.ok) throw new Error('Header file not found!');
      return response.text();
    })
    .then(data => {
      const placeholder = document.getElementById('header-placeholder');
      placeholder.innerHTML = data;
      console.log('Header loaded, initializing menu...');
      // Initialize menu after header is inserted
      initializeMobileMenu();
      // Set active navigation link based on current page
      setActiveNavLink();
    })
    .catch(err => console.error('Error loading header:', err));

  // 2. Load footer if placeholder exists
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    fetch('/html/footer.html')
      .then(response => {
        if (!response.ok) throw new Error('Footer file not found!');
        return response.text();
      })
      .then(data => {
        footerPlaceholder.outerHTML = data;
      })
      .catch(err => console.error('Error loading footer:', err));
  }

  // 3. Add floating contact button
  createFloatingButton();
});

/**
 * Mobile Menu Logic
 * This function is called only AFTER header.html is loaded into the DOM.
 */
function initializeMobileMenu() {
//   console.log('=== Initializing Mobile Menu ===');
//   console.log('Searching for elements...');
  
  const btn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('mobile-overlay');

  // Debugging logs to verify elements are found
//   console.log('Button:', btn);
//   console.log('Drawer:', drawer);
//   console.log('Overlay:', overlay);
  
  // Additional debug: check if elements exist in DOM
//   console.log('All elements with id mobile-drawer:', document.querySelectorAll('#mobile-drawer'));
//   console.log('All elements with id mobile-overlay:', document.querySelectorAll('#mobile-overlay'));

  if (!btn || !drawer || !overlay) {
    console.error('Mobile menu elements not found in the DOM.');
    console.log('Current body HTML:', document.body.innerHTML.substring(0, 500));
    return;
  }

  console.log('All elements found! Setting up event listeners...');

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close menu');
    drawer.classList.add('is-open');
    overlay.classList.add('is-visible');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scrolling
  }

  // Toggle menu on button click
  btn.addEventListener('click', function() {
    const isOpen = drawer.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when clicking the darkened overlay
  overlay.addEventListener('click', closeMenu);

  // Close menu when pressing the Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close menu if window is resized to desktop width (1024px)
  window.addEventListener('resize', function() {
    if (window.innerWidth >= 1024 && drawer.classList.contains('is-open')) {
      closeMenu();
    }
  });
}

/**
 * Set Active Navigation Link
 * Detects the current page and adds 'active' class to matching nav links
 */
function setActiveNavLink() {
  // Get current page filename from URL (case-insensitive)
  const currentPage = (window.location.pathname.split('/').pop() || 'Home.html').toLowerCase();
  
  // Select all navigation links (both desktop and mobile)
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  
  allNavLinks.forEach(link => {
    const linkPage = link.getAttribute('href').split('/').pop().toLowerCase();
    
    // Add 'active' class if the link matches current page
    if (linkPage === currentPage || 
        (currentPage === '' && linkPage === 'home.html') ||
        (currentPage === 'home.html' && linkPage === 'home.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Create Floating WhatsApp Button
 * Adds a persistent WhatsApp button in the bottom right corner on all pages
 */
function createFloatingButton() {
  const floatingBtn = document.createElement('a');
  floatingBtn.href = 'https://wa.me/+60122217822';
  floatingBtn.target = '_blank';
  floatingBtn.rel = 'noopener noreferrer';
  floatingBtn.className = 'floating-contact-btn';
  floatingBtn.setAttribute('aria-label', 'Chat on WhatsApp');
  floatingBtn.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <use href="../asset/icon/icons.svg#icon-message"></use>
    </svg>
    <span>WhatsApp</span>
  `;
  
  document.body.appendChild(floatingBtn);
}

/**
 * Contact Page Functions
 * Tab switching and file upload functionality for Contact.html
 */

/* ── Tab switching ── */
function switchTab(tab) {
  const tabs    = ['enquiry', 'apply'];
  const isApply = tab === 'apply';

  tabs.forEach(t => {
    const btn   = document.getElementById('tab-' + t);
    const panel = document.getElementById('panel-' + t);
    const active = t === tab;
    btn.classList.toggle('form-tab--active', active);
    btn.setAttribute('aria-selected', active);
    panel.style.display = active ? '' : 'none';
  });
}

/* ── File upload ── */
function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    alert('File is too large. Please upload a file under 5 MB.');
    input.value = '';
    return;
  }

  document.getElementById('uploadZone').classList.add('upload-zone--has-file');
  document.getElementById('uploadFileName').textContent = file.name;
  document.getElementById('uploadFileInfo').style.display = 'flex';
  document.getElementById('uploadIconWrap').style.display = 'none';
  document.getElementById('uploadPrimary').style.display  = 'none';
}

function removeFile() {
  const input = document.getElementById('cvFile');
  input.value = '';
  document.getElementById('uploadZone').classList.remove('upload-zone--has-file');
  document.getElementById('uploadFileInfo').style.display = 'none';
  document.getElementById('uploadIconWrap').style.display = '';
  document.getElementById('uploadPrimary').style.display  = '';
}

/* ── Drag-and-drop initialization ── */
document.addEventListener('DOMContentLoaded', function() {
  const zone = document.getElementById('uploadZone');
  if (zone) {
    zone.addEventListener('dragover', e => { 
      e.preventDefault(); 
      zone.classList.add('upload-zone--drag'); 
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('upload-zone--drag');
    });
    
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('upload-zone--drag');
      const dt = e.dataTransfer;
      if (dt.files.length) {
        const input = document.getElementById('cvFile');
        // DataTransfer trick to assign dropped file
        try {
          input.files = dt.files;
        } catch(err) {
          // fallback: just show the name
        }
        handleFileSelect({ files: dt.files });
      }
    });
  }
});