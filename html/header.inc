<header class="site-header">
  <div class="container-wide header-inner">

    <!-- Logo -->
    <a class="site-logo" href="/html/Home.html">
      MTI<span class="accent-text">Resource</span>
    </a>

    <!-- Desktop Navigation (hidden below 1024px) -->
    <nav class="desktop-nav" aria-label="Main navigation">
      <a class="nav-link" href="/html/Home.html">Home</a>
      <a class="nav-link" href="/html/About.html">About</a>
      <a class="nav-link" href="/html/Services.html">Services</a>
      <a class="nav-link" href="/html/Industries.html">Industries &amp; Roles</a>
      <a class="nav-link" href="/html/Process.html">Process</a>
      <a class="nav-cta" href="/html/Contact.html">Get in Touch</a>
    </nav>

    <!-- Hamburger button (hidden above 1024px) -->
    <button
      class="mobile-menu-btn"
      id="mobile-menu-btn"
      aria-label="Open menu"
      aria-expanded="false"
      aria-controls="mobile-drawer"
    >
      <!-- Hamburger icon (shown when menu closed) -->
      <svg class="icon-hamburger" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="4" x2="20" y1="6"  y2="6"/>
        <line x1="4" x2="20" y1="12" y2="12"/>
        <line x1="4" x2="20" y1="18" y2="18"/>
      </svg>
      <!-- Close icon (shown when menu open) -->
      <svg class="icon-close" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
           viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
           stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
      </svg>
    </button>

  </div>

  <!-- Mobile Drawer (slides down from header on small screens) -->
  <div
    id="mobile-drawer"
    class="mobile-drawer"
    aria-hidden="true"
    role="dialog"
    aria-label="Navigation menu"
  >
    <nav class="mobile-nav" aria-label="Mobile navigation">
      <a class="mobile-nav-link" href="/html/Home.html">Home</a>
      <a class="mobile-nav-link" href="/html/About.html">About</a>
      <a class="mobile-nav-link" href="/html/Services.html">Services</a>
      <a class="mobile-nav-link" href="/html/Industries.html">Industries &amp; Roles</a>
      <a class="mobile-nav-link" href="/html/Process.html">Process</a>
      <a class="mobile-nav-cta" href="/html/Contact.html">Get in Touch</a>
    </nav>
  </div>
</header>

<!-- Overlay that dims the page behind the open menu -->
<div id="mobile-overlay" class="mobile-overlay" aria-hidden="true"></div>