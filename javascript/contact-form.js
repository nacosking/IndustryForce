// Contact Form Submission Handler
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const formStatus = document.getElementById('formStatus');

  // Check if config is loaded
  if (typeof window.AppConfig === 'undefined') {
    console.error('Configuration not loaded. Make sure config.js is included before contact-form.js');
    return;
  }

  // Only run if contact form exists on the page
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      company: document.getElementById('company').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      details: document.getElementById('details').value.trim()
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.company) {
      showStatus('Please fill in all required fields', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showStatus('Please enter a valid email address', 'error');
      return;
    }

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Sending...';

    try {
      // Get API endpoint from configuration (no hardcoded values)
      const API_URL = window.AppConfig.getApiEndpoint('sendEmail');
      
      if (!API_URL) {
        throw new Error('API endpoint not configured');
      }

      console.log(`Sending request to: ${API_URL}`); // For debugging

      // Send to backend API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        timeout: window.AppConfig.form.timeoutDuration
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showStatus(result.message, 'success');
        form.reset(); // Clear the form
      } else {
        showStatus(result.message || 'Something went wrong. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      showStatus('Failed to send message. Please check if the server is running or contact us directly.', 'error');
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      btnText.textContent = 'Submit Enquiry';
    }
  });

  function showStatus(message, type) {
    formStatus.textContent = message;
    formStatus.style.display = 'block';
    
    if (type === 'success') {
      formStatus.style.backgroundColor = '#d4edda';
      formStatus.style.color = '#155724';
      formStatus.style.border = '1px solid #c3e6cb';
    } else {
      formStatus.style.backgroundColor = '#f8d7da';
      formStatus.style.color = '#721c24';
      formStatus.style.border = '1px solid #f5c6cb';
    }

    // Auto-hide after configured duration for success messages
    if (type === 'success') {
      setTimeout(() => {
        formStatus.style.display = 'none';
      }, window.AppConfig.form.successMessageDuration);
    }
  }
});
