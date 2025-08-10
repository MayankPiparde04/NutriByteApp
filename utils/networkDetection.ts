import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NetworkInfo {
  frontendIP: string;
  frontendPort: string;
  possibleBackendUrls: string[];
  detectionMethod: string;
}

export interface DetailedHealthCheckResult {
  success: boolean;
  url: string;
  status?: number;
  data?: any;
  error?: string;
  responseTime?: number;
  networkInfo?: NetworkInfo;
}

// Get network information dynamically
export const getNetworkInfo = (): NetworkInfo => {
  let frontendIP = 'localhost';
  let frontendPort = '8081';
  let detectionMethod = 'default';
  
  // Try to get IP from Expo constants
  if (Constants.expoConfig?.hostUri) {
    const hostUri = Constants.expoConfig.hostUri;
    console.log(`📱 Expo hostUri: ${hostUri}`);
    
    // Extract IP and port from hostUri (format: "192.168.1.5:8081")
    const [ip, port] = hostUri.split(':');
    if (ip && port) {
      frontendIP = ip;
      frontendPort = port;
      detectionMethod = 'expo-hostUri';
    }
  }
  
  // Fallback: try to get from manifest
  if (frontendIP === 'localhost' && Constants.manifest?.hostUri) {
    const hostUri = Constants.manifest.hostUri;
    console.log(`📱 Manifest hostUri: ${hostUri}`);
    
    const [ip, port] = hostUri.split(':');
    if (ip && port) {
      frontendIP = ip;
      frontendPort = port;
      detectionMethod = 'manifest-hostUri';
    }
  }
  
  // Generate possible backend URLs based on detected frontend IP
  const possibleBackendUrls = generateBackendUrls(frontendIP);
  
  return {
    frontendIP,
    frontendPort,
    possibleBackendUrls,
    detectionMethod,
  };
};

// Generate possible backend URLs based on frontend IP
const generateBackendUrls = (frontendIP: string): string[] => {
  const urls: string[] = [];
  
  if (Platform.OS === 'android') {
    // Android emulator specific URLs
    urls.push('http://10.0.2.2:5000/api'); // Standard Android emulator
    
    // If we detected a real IP, try using it
    if (frontendIP !== 'localhost' && frontendIP !== '127.0.0.1') {
      urls.push(`http://${frontendIP}:5000/api`);
    }
    
    // Common network IPs that might work
    urls.push('http://10.171.201.130:5000/api'); // Current detected IP
    urls.push('http://192.168.1.5:5000/api');    // Common local network
    
    // Common fallbacks
    urls.push('http://localhost:5000/api');
    urls.push('http://127.0.0.1:5000/api');
    
  } else if (Platform.OS === 'ios') {
    // iOS simulator URLs
    urls.push('http://localhost:5000/api');
    
    // If we detected a real IP, try using it
    if (frontendIP !== 'localhost' && frontendIP !== '127.0.0.1') {
      urls.push(`http://${frontendIP}:5000/api`);
    }
    
  } else {
    // Web platform
    urls.push('http://localhost:5000/api');
    
    if (frontendIP !== 'localhost' && frontendIP !== '127.0.0.1') {
      urls.push(`http://${frontendIP}:5000/api`);
    }
  }
  
  return urls;
};

// Enhanced health check with network detection
export const performDetailedHealthCheck = async (): Promise<DetailedHealthCheckResult> => {
  const networkInfo = getNetworkInfo();
  
  console.log('🌐 Network Detection Results:');
  console.log(`   Frontend IP: ${networkInfo.frontendIP}`);
  console.log(`   Frontend Port: ${networkInfo.frontendPort}`);
  console.log(`   Detection Method: ${networkInfo.detectionMethod}`);
  console.log(`   Platform: ${Platform.OS}`);
  console.log('📡 Testing backend URLs:', networkInfo.possibleBackendUrls);
  
  // Test each possible backend URL
  for (const baseUrl of networkInfo.possibleBackendUrls) {
    const result = await testSingleEndpoint(baseUrl);
    if (result.success) {
      console.log(`✅ Successfully connected to backend: ${baseUrl}`);
      return {
        ...result,
        networkInfo,
      };
    } else {
      console.log(`❌ Failed to connect to: ${baseUrl} - ${result.error}`);
    }
  }
  
  // If all failed, return the first failure with network info
  const firstAttempt = await testSingleEndpoint(networkInfo.possibleBackendUrls[0]);
  return {
    ...firstAttempt,
    networkInfo,
  };
};

// Test a single endpoint
const testSingleEndpoint = async (baseUrl: string): Promise<DetailedHealthCheckResult> => {
  const startTime = Date.now();
  
  try {
    console.log(`🔍 Testing: ${baseUrl}/health`);
    
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove timeout as it's not supported in all environments
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

// Get the working backend URL (simplified interface)
export const getOptimalBackendUrl = async (): Promise<string> => {
  const result = await performDetailedHealthCheck();
  return result.success ? result.url : getNetworkInfo().possibleBackendUrls[0];
};
