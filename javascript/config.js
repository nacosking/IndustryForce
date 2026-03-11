// API Configuration
// This file allows you to configure the backend URL for different environments
// without modifying the main application code

const config = {
  // API Configuration
  api: {
    // Leave empty to auto-detect (recommended for most deployments)
    // The system will automatically use:
    // - 'http://localhost:3000' when running locally
    // - https://goldenlaneresources.com when deployed
    baseUrl: '',
    
    // Override with specific URL if frontend and backend are on different domains
    // If your backend is on a different domain, uncomment and set:
    // baseUrl: 'https://your-backend.onrender.com',
    // baseUrl: 'https://api.goldenlaneresources.com',
    
    // API endpoints
    endpoints: {
      sendEmail: '/send-email',
      applyJob: '/apply-job',
      health: '/health'
    }
  },

  // Development settings
  dev: {
    localPort: 3000,
    localHost: 'localhost'
  },

  // Form settings
  form: {
    successMessageDuration: 5000, // milliseconds
    maxRetries: 3,
    timeoutDuration: 30000 // 30 seconds
  }
};

// Auto-detect API URL if not explicitly set
function getApiBaseUrl() {
  // If baseUrl is explicitly set, use it
  if (config.api.baseUrl && config.api.baseUrl.trim() !== '') {
    return config.api.baseUrl;
  }

  // Auto-detect based on environment
  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname === '' ||
                  hostname.includes('local');

  if (isLocal) {
    // Local development
    return `http://${config.dev.localHost}:${config.dev.localPort}`;
  } else {
    // Production - use same domain as frontend
    return window.location.origin;
  }
}

// Get full API endpoint URL
function getApiEndpoint(endpointName) {
  const baseUrl = getApiBaseUrl();
  const endpoint = config.api.endpoints[endpointName];
  
  if (!endpoint) {
    console.error(`API endpoint '${endpointName}' not found in config`);
    return null;
  }

  return `${baseUrl}${endpoint}`;
}

// Export configuration
window.AppConfig = {
  ...config,
  getApiEndpoint,
  getApiBaseUrl
};
