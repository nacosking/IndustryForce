// DEVELOPMENT Configuration Template
// This is the default - config.js should look like this for local development

const config = {
  api: {
    // Empty = auto-detect localhost:3000
    baseUrl: '',
    
    endpoints: {
      sendEmail: '/send-email',
      health: '/health'
    }
  },

  dev: {
    localPort: 3000,        // Your local backend port
    localHost: 'localhost'  // Your local backend host
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
