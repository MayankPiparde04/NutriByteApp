import { Platform } from 'react-native';
import { getNetworkInfo, performDetailedHealthCheck } from '../utils/networkDetection';

// This is a simple test script to validate network detection
// Can be called from anywhere in the app for debugging

export const runNetworkDiagnostics = async () => {
  console.log('\n🌐 =================================');
  console.log('🌐 NETWORK DIAGNOSTICS STARTING');
  console.log('🌐 =================================\n');
  
  // Step 1: Get network info
  console.log('📡 Step 1: Detecting network configuration...');
  const networkInfo = getNetworkInfo();
  
  console.log('📱 Frontend Details:');
  console.log(`   IP: ${networkInfo.frontendIP}`);
  console.log(`   Port: ${networkInfo.frontendPort}`);
  console.log(`   Detection Method: ${networkInfo.detectionMethod}`);
  console.log(`   Platform: ${Platform.OS}`);
  
  console.log('\n🎯 Backend URL Candidates:');
  networkInfo.possibleBackendUrls.forEach((url, index) => {
    console.log(`   ${index + 1}. ${url}`);
  });
  
  // Step 2: Test each backend URL
  console.log('\n🔍 Step 2: Testing backend connectivity...');
  const healthResult = await performDetailedHealthCheck();
  
  if (healthResult.success) {
    console.log('\n✅ SUCCESS!');
    console.log(`   Working Backend: ${healthResult.url}`);
    console.log(`   Response Time: ${healthResult.responseTime}ms`);
    console.log(`   Backend Status: ${healthResult.data?.status}`);
    console.log(`   Backend Version: ${healthResult.data?.version}`);
  } else {
    console.log('\n❌ FAILED!');
    console.log(`   Error: ${healthResult.error}`);
    console.log(`   Last Attempted: ${healthResult.url}`);
  }
  
  console.log('\n🌐 =================================');
  console.log('🌐 NETWORK DIAGNOSTICS COMPLETE');
  console.log('🌐 =================================\n');
  
  return {
    networkInfo,
    healthResult,
    summary: {
      frontendIP: networkInfo.frontendIP,
      workingBackend: healthResult.success ? healthResult.url : null,
      success: healthResult.success,
      responseTime: healthResult.responseTime,
    }
  };
};

// Quick health check for debugging
export const quickHealthCheck = async () => {
  console.log('⚡ Quick health check...');
  const result = await performDetailedHealthCheck();
  console.log(result.success ? `✅ Backend OK: ${result.url}` : `❌ Backend Failed: ${result.error}`);
  return result;
};
