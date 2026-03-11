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

      // Debug logging
      console.log('=== Contact Form Debug ===');
      console.log('Current window location:', window.location.href);
      console.log('Current origin:', window.location.origin);
      console.log('API URL:', API_URL);
      console.log('Form data:', formData);
      console.log('=========================');

      // Send to backend API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        timeout: window.AppConfig.form.timeoutDuration
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

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

// Apply Form Submission Handler (with CV upload)
document.addEventListener('DOMContentLoaded', function() {
  const applyForm = document.getElementById('applyForm');
  const applySubmitBtn = document.getElementById('applySubmitBtn');
  const applyBtnText = document.getElementById('applyBtnText');
  const applyFormStatus = document.getElementById('applyFormStatus');

  // Only run if apply form exists on the page
  if (!applyForm) return;

  applyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData();
    formData.append('name', document.getElementById('apply-name').value.trim());
    formData.append('email', document.getElementById('apply-email').value.trim());
    formData.append('phone', document.getElementById('apply-phone').value.trim());
    formData.append('role', document.getElementById('apply-role').value.trim());
    formData.append('experience', document.getElementById('apply-experience').value.trim());
    
    // Get CV file
    const cvFile = document.getElementById('cvFile').files[0];
    if (cvFile) {
      formData.append('cv', cvFile);
    }

    // Basic validation
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const role = formData.get('role');

    if (!name || !email || !phone || !role) {
      showApplyStatus('Please fill in all required fields', 'error');
      return;
    }

    if (!cvFile) {
      showApplyStatus('Please upload your CV', 'error');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showApplyStatus('Please enter a valid email address', 'error');
      return;
    }

    // Disable submit button and show loading state
    applySubmitBtn.disabled = true;
    applyBtnText.textContent = 'Submitting...';

    try {
      // Get API endpoint from configuration
      const API_URL = window.AppConfig.getApiEndpoint('applyJob');
      
      if (!API_URL) {
        throw new Error('API endpoint not configured');
      }

      console.log('=== Apply Form Debug ===');
      console.log('API URL:', API_URL);
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Role:', role);
      console.log('CV file:', cvFile.name, cvFile.size, 'bytes');
      console.log('========================');

      // Send to backend API with file upload
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData // Don't set Content-Type header - browser sets it with boundary
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const result = await response.json();

      if (response.ok && result.success) {
        showApplyStatus(result.message, 'success');
        applyForm.reset();
        // Reset file upload UI
        if (typeof removeFile === 'function') {
          removeFile();
        }
      } else {
        showApplyStatus(result.message || 'Something went wrong. Please try again.', 'error');
      }

    } catch (error) {
      console.error('Apply form submission error:', error);
      showApplyStatus('Failed to submit application. Please try again or email us directly.', 'error');
    } finally {
      // Re-enable submit button
      applySubmitBtn.disabled = false;
      applyBtnText.textContent = 'Submit Application';
    }
  });

  function showApplyStatus(message, type) {
    applyFormStatus.textContent = message;
    applyFormStatus.style.display = 'block';
    
    if (type === 'success') {
      applyFormStatus.style.backgroundColor = '#d4edda';
      applyFormStatus.style.color = '#155724';
      applyFormStatus.style.border = '1px solid #c3e6cb';
    } else {
      applyFormStatus.style.backgroundColor = '#f8d7da';
      applyFormStatus.style.color = '#721c24';
      applyFormStatus.style.border = '1px solid #f5c6cb';
    }

    // Auto-hide after configured duration for success messages
    if (type === 'success') {
      setTimeout(() => {
        applyFormStatus.style.display = 'none';
      }, window.AppConfig.form.successMessageDuration);
    }
  }
});
