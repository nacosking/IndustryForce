// PRODUCTION Configuration Template
// Copy this content to config.js when deploying to production

const config = {
  api: {
    // OPTION A: Same domain deployment (Frontend + Backend together)
    // Leave empty - it will auto-detect your domain
    baseUrl: '',
    
    // OPTION B: Different domains (e.g., Netlify + Render)
    // Uncomment and set your backend URL:
    // baseUrl: 'https://your-backend-url.onrender.com',
    // baseUrl: 'https://api.yourdomain.com',
    
    endpoints: {
      sendEmail: '/send-email',
      health: '/health'
    }
  },

  dev: {
    localPort: 3000,
    localHost: 'localhost'
  },

  form: {
    successMessageDuration: 5000,
    maxRetries: 3,
    timeoutDuration: 30000
  }
};

// Auto-detect API URL if not explicitly set
function getApiBaseUrl() {
  if (config.api.baseUrl && config.api.baseUrl.trim() !== '') {
    return config.api.baseUrl;
  }

  const hostname = window.location.hostname;
  const isLocal = hostname === 'localhost' || 
                  hostname === '127.0.0.1' || 
                  hostname === '' ||
                  hostname.includes('local');

  if (isLocal) {
    return `http://${config.dev.localHost}:${config.dev.localPort}`;
  } else {
    return window.location.origin;
  }
}

function getApiEndpoint(endpointName) {
  const baseUrl = getApiBaseUrl();
  const endpoint = config.api.endpoints[endpointName];
  
  if (!endpoint) {
    console.error(`API endpoint '${endpointName}' not found in config`);
    return null;
  }

  return `${baseUrl}${endpoint}`;
}

window.AppConfig = {
  ...config,
  getApiEndpoint,
  getApiBaseUrl
};
