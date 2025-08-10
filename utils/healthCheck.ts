import { Platform } from 'react-native';

export interface HealthCheckResult {
  success: boolean;
  url: string;
  status?: number;
  data?: any;
  error?: string;
  responseTime?: number;
}

// Try different base URLs based on environment
const getBaseUrls = (): string[] => {
  if (Platform.OS === 'web') {
    return ['http://localhost:5000/api'];
  }
  
  if (Platform.OS === 'ios') {
    return ['http://localhost:5000/api'];
  }
  
  if (Platform.OS === 'android') {
    return [
      'http://10.0.2.2:5000/api',      // Android emulator default
      'http://localhost:5000/api',      // Sometimes works
      'http://10.171.201.130:5000/api',
      'http://192.168.1.5:8081', // Your current IP
    ];
  }
  
  return ['http://localhost:5000/api'];
};

export const testHealthEndpoint = async (baseUrl: string): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    console.log(`Testing health endpoint: ${baseUrl}/health`);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000, // 5 second timeout
    });

    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        url: baseUrl,
        status: response.status,
        data,
        responseTime,
      };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        url: baseUrl,
        status: response.status,
        error: `HTTP ${response.status}: ${errorText}`,
        responseTime,
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      success: false,
      url: baseUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
};

export const findWorkingBaseUrl = async (): Promise<HealthCheckResult> => {
  const baseUrls = getBaseUrls();
  
  console.log('Testing backend connectivity with URLs:', baseUrls);
  
  for (const baseUrl of baseUrls) {
    const result = await testHealthEndpoint(baseUrl);
    if (result.success) {
      console.log(`✅ Found working backend at: ${baseUrl}`);
      return result;
    } else {
      console.log(`❌ Failed to connect to: ${baseUrl} - ${result.error}`);
    }
  }
  
  // If no URL works, return the first failure
  return await testHealthEndpoint(baseUrls[0]);
};

export const getOptimalBaseUrl = async (): Promise<string> => {
  const result = await findWorkingBaseUrl();
  return result.success ? result.url : getBaseUrls()[0];
};
