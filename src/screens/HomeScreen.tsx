import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import Geolocation, { GeoPosition } from 'react-native-geolocation-service';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'https://backend-api-x0h2.onrender.com';


// Define TypeScript interfaces
interface Location {
  latitude: number;
  longitude: number;
}

interface ReadingData {
  latitude: number;
  longitude: number;
  signal_strength: number;
  operator: string;
}

interface LastReading extends ReadingData {
  timestamp: string;
  success: boolean;
  error?: string;
}

const HomeScreen: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [operator, setOperator] = useState<string>('Unknown');
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastReading, setLastReading] = useState<LastReading | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    requestLocationPermission();
    getOperatorName();

    return () => {
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [trackingInterval]);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        (PermissionsAndroid.PERMISSIONS as any).READ_PHONE_STATE,
      ]);

      const isGranted =
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED ||
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED;

      if (!isGranted) {
        Alert.alert('Permission Denied', 'Please grant location and phone state permissions.');
      }
    } catch (error) {
      console.warn('Permission request error:', error);
    }
  };

  const getOperatorName = async () => {
    try {
      const carrierName = await DeviceInfo.getCarrier();
      setOperator(carrierName || 'Unknown');
    } catch (error) {
      console.log('Error getting operator:', error);
      setOperator('Unknown');
    }
  };
  const getRealSignalStrength = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const { NativeModules } = require('react-native');
      const { SignalStrengthModule } = NativeModules;

      if (SignalStrengthModule) {
        SignalStrengthModule.getSignalStrength((error: string, strength: number) => {
          if (error) {
            console.warn('Signal error:', error);
            reject(new Error('Failed to retrieve signal strength from native module.'));
          } else {
            console.log('📡 Real signal strength (dBm):', strength);
            resolve(strength);
          }
        });
      } else {
        console.warn('SignalStrengthModule not found');
        reject(new Error('SignalStrengthModule not available.'));
      }
    });
  };

  const collectSignalData = async () => {
    try {
      const signalStrength = await getRealSignalStrength();

      Geolocation.getCurrentPosition(
        async (position: GeoPosition) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          const readingData: ReadingData = {
            latitude,
            longitude,
            signal_strength: signalStrength,
            operator,
          };
          
          // ✅ Get token from AsyncStorage
          const token = await AsyncStorage.getItem('token');

          axios
            .post(`${API_BASE_URL}/api/readings/`, readingData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response) => {
              setLastReading({
                ...readingData,
                timestamp: new Date().toISOString(),
                success: true,
              });
              console.log('✅ Data sent:', response.data);
            })
            .catch((error) => {
              console.error('❌ Upload failed:', error);
              setLastReading({
                ...readingData,
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message,
              });
            });
        },
        (error) => {
          console.log('📍 Location error:', error);
          Alert.alert('GPS Error', 'Unable to get location. Check settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    } catch (error: any) {
      console.error('❌ Signal strength collection failed:', error.message);
      Alert.alert('Signal Error', 'Could not get real signal strength. Make sure native module is working.');
    }
  };

  const startTracking = () => {
    if (isTracking) return;

    collectSignalData(); // First reading now

    const interval = setInterval(() => {
      collectSignalData();
    }, 30000);

    setTrackingInterval(interval);
    setIsTracking(true);

    Alert.alert('Tracking Started', 'SinyalKu is now monitoring every 30 seconds.');
  };

  const stopTracking = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setIsTracking(false);
    Alert.alert('Tracking Stopped', 'Monitoring has been stopped.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView} contentContainerStyle={{ paddingBottom: 20 + insets.bottom }}>
        <View style={styles.header}>
          <Text style={styles.title}>SinyalKu</Text>
          <Text style={styles.subtitle}>Network Quality Monitor</Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[styles.statusIndicator, { backgroundColor: isTracking ? '#4CAF50' : '#F44336' }]}
          />
          <Text style={styles.statusText}>
            {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
          </Text>
        </View>

        <View style={styles.dataContainer}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          {location ? (
            <>
              <Text style={styles.dataText}>Latitude: {location.latitude.toFixed(6)}</Text>
              <Text style={styles.dataText}>Longitude: {location.longitude.toFixed(6)}</Text>
            </>
          ) : (
            <Text style={styles.dataText}>Location not available</Text>
          )}

          <Text style={styles.sectionTitle}>Network Info</Text>
          <Text style={styles.dataText}>Operator: {operator}</Text>
        </View>

        {lastReading && (
          <View style={styles.dataContainer}>
            <Text style={styles.sectionTitle}>Last Reading</Text>
            <Text style={styles.dataText}>Signal: {lastReading.signal_strength} dBm</Text>
            <Text style={styles.dataText}>
              Time: {new Date(lastReading.timestamp).toLocaleTimeString()}
            </Text>
            <View style={styles.statusRow}>
              <Text style={styles.dataText}>Status: </Text>
              <Text
                style={[
                  styles.dataText,
                  { color: lastReading.success ? '#4CAF50' : '#F44336' },
                ]}
              >
                {lastReading.success ? 'Sent Successfully' : 'Failed to Send'}
              </Text>
            </View>
            {lastReading.error && (
              <Text style={[styles.dataText, { color: '#F44336', fontSize: 12 }]}>
                Error: {lastReading.error}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.startButton, isTracking && styles.disabledButton]}
            onPress={startTracking}
            disabled={isTracking}
          >
            <Text style={styles.buttonText}>Start Tracking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.stopButton, !isTracking && styles.disabledButton]}
            onPress={stopTracking}
            disabled={!isTracking}
          >
            <Text style={styles.buttonText}>Stop Tracking</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>• SinyalKu collects your location & signal strength data every 30 seconds</Text>
          <Text style={styles.infoText}>• Data is sent to our servers to improve coverage maps</Text>
          <Text style={styles.infoText}>• Coverage Maps: sinyalku.netlify.app </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
    marginHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dataContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: '#333',
  },
  dataText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
    lineHeight: 20,
  },
});

export default HomeScreen;
