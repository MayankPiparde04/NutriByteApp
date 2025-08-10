import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { performDetailedHealthCheck } from '../utils/networkDetection';

interface HealthCheckButtonProps {
  isDark?: boolean;
  onResult?: (result: any) => void;
}

export const HealthCheckButton: React.FC<HealthCheckButtonProps> = ({ 
  isDark = false, 
  onResult 
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const runHealthCheck = async () => {
    setIsChecking(true);
    try {
      console.log('🏥 Starting comprehensive health check...');
      const result = await performDetailedHealthCheck();
      
      setLastResult(result);
      onResult?.(result);
      
      // Show result in alert
      const message = result.success 
        ? `✅ Backend Connected!\n\nURL: ${result.url}\nResponse Time: ${result.responseTime}ms\nFrontend IP: ${result.networkInfo?.frontendIP}\nDetection: ${result.networkInfo?.detectionMethod}`
        : `❌ Backend Connection Failed\n\nError: ${result.error}\nTested URLs: ${result.networkInfo?.possibleBackendUrls.length}`;
      
      Alert.alert('Health Check Results', message);
      
    } catch (error) {
      console.error('Health check error:', error);
      Alert.alert('Health Check Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={runHealthCheck}
      disabled={isChecking}
      className={`p-3 rounded-full flex-row items-center ${
        isChecking
          ? 'bg-gray-400'
          : lastResult?.success
            ? 'bg-green-600'
            : lastResult?.success === false
              ? 'bg-red-600'
              : isDark
                ? 'bg-gray-800'
                : 'bg-gray-100'
      }`}
    >
      <Ionicons
        name={isChecking ? 'sync' : lastResult?.success ? 'checkmark-circle' : lastResult?.success === false ? 'close-circle' : 'pulse'}
        size={20}
        color={
          lastResult?.success || lastResult?.success === false
            ? 'white'
            : isDark
              ? '#e5e7eb'
              : '#374151'
        }
        style={isChecking ? { transform: [{ rotate: '45deg' }] } : undefined}
      />
      <Text
        className={`ml-2 text-sm ${
          lastResult?.success || lastResult?.success === false
            ? 'text-white font-medium'
            : isDark
              ? 'text-gray-200'
              : 'text-gray-700'
        }`}
      >
        {isChecking ? 'Checking...' : 'Health Check'}
      </Text>
    </TouchableOpacity>
  );
};

export default HealthCheckButton;
