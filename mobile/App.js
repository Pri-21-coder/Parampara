// mobile/App.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import ImagePicker from 'react-native-image-picker';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  PermissionsAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

// Fix: Check if running on mobile or web
const isMobile = Platform.OS === 'android' || Platform.OS === 'ios';

// Fix: Only import mobile-specific modules on mobile
let ImagePicker, AudioRecorderPlayer;
if (isMobile) {
  ImagePicker = require('react-native-image-picker').default;
  AudioRecorderPlayer = require('react-native-audio-recorder-player').default;
}


const App = () => {
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [offlineContent, setOfflineContent] = useState([]);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [images, setImages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced');

  const audioRecorderPlayer = new AudioRecorderPlayer();

  const [deviceId, setDeviceId] = useState(null);

  // Fix: Initialize audio recorder only on mobile
  const audioRecorderPlayer = isMobile ? new AudioRecorderPlayer() : null;

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Get or create user ID
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        userId = `user_${Date.now()}`;
        await AsyncStorage.setItem('userId', userId);
      }
      setUserId(userId);

      // Load offline content
      await loadOfflineContent();
      
      // Get location
      await getLocation();
      
      // Register device
      await registerDevice();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const registerDevice = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mobile/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: Platform.OS,
          osVersion: Platform.Version,
          deviceName: 'Mobile Device'
        })
      });

      const data = await response.json();
      if (data.success) {

        setDeviceId(data.device.id);

        await AsyncStorage.setItem('deviceId', data.device.id);
      }
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const getLocation = () => {

    if (!isMobile) {
      setLocation({ lat: 22.5726, lng: 88.3639 });
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);

        // Fallback location
        setLocation({ lat: 22.5726, lng: 88.3639 });

      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const loadOfflineContent = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/mobile/offline?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setOfflineContent(data.content);
        setOfflineContent(data.content || []);
      }
    } catch (error) {
      console.error('Error loading offline content:', error);
    }
  };

  const downloadContent = async (contentId) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/mobile/offline/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, userId })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Content downloaded for offline use!');
        await loadOfflineContent();
      }
    } catch (error) {
      console.error('Error downloading content:', error);
      Alert.alert('Error', 'Failed to download content');
    } finally {
      setIsLoading(false);
    }
  };

  const recordAudio = async () => {

    if (isRecording) {
      // Stop recording
      const result = await audioRecorderPlayer.stopRecorder();
      setIsRecording(false);
      
      // Upload recording
      await uploadAudio(result);
    } else {
      // Start recording
      try {

    if (!isMobile) {
      Alert.alert('Info', 'Audio recording is only available on mobile devices');
      return;
    }

    if (isRecording) {
      // Stop recording
      try {
        const result = await audioRecorderPlayer.stopRecorder();
        setIsRecording(false);
        // Upload recording
        await uploadAudio(result);
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
    } else {
      // Start recording
      try {
        // Request permissions
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'App needs access to your microphone to record audio.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Cannot record audio without permission');
            return;
          }
        }


        const path = await audioRecorderPlayer.startRecorder();
        setIsRecording(true);
        Alert.alert('Recording', 'Recording started...');
      } catch (error) {
        console.error('Error recording:', error);

        Alert.alert('Error', 'Failed to start recording');

      }
    }
  };

  const uploadAudio = async (audioData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/mobile/audio/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          audioData: {
            url: audioData,
            duration: 0,
            size: 0
          }
        })
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Audio recorded and uploaded!');
        await loadAudioRecordings();
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAudioRecordings = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/mobile/audio?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setAudioRecordings(data.recordings);
        setAudioRecordings(data.recordings || []);
      }
    } catch (error) {
      console.error('Error loading audio recordings:', error);
    }
  };

  const selectImage = async () => {
    const options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.uri };
        await uploadImage(source, response);
      }
    });

    if (!isMobile) {
      Alert.alert('Info', 'Image upload is only available on mobile devices');
      return;
    }

    // Fix: Use image picker correctly
    try {
      const options = {
        title: 'Select Image',
        storageOptions: {
          skipBackup: true,
          path: 'images'
        }
      };

      ImagePicker.showImagePicker(options, async (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        } else {
          const source = { uri: response.uri };
          await uploadImage(source, response);
        }
      });
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  const uploadImage = async (source, response) => {
    setIsLoading(true);
    try {
      const imageData = {
        url: source.uri,
        size: response.fileSize || 0,
        width: response.width,
        height: response.height
      };

      const apiResponse = await fetch('http://localhost:3000/api/mobile/image/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, imageData })
      });

      const data = await apiResponse.json();
      if (data.success) {
        Alert.alert('Success', 'Image uploaded!');
        await loadImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/mobile/images?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setImages(data.images);
        setImages(data.images || []);

      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const syncOfflineData = async () => {
    setIsLoading(true);
    setSyncStatus('syncing');
    try {
      const response = await fetch('http://localhost:3000/api/mobile/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          offlineData: [
            {
              type: 'memory',
              data: {
                title: 'Offline Memory',
                description: 'Created while offline',
                timestamp: new Date().toISOString()
              }
            }
          ]
        })
      });

      const data = await response.json();
      if (data.success) {
        setSyncStatus('synced');
        Alert.alert('Success', 'Data synced successfully!');
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderOfflineContent = ({ item }) => (
    <View style={styles.contentCard}>
      <Text style={styles.contentTitle}>{item.name}</Text>
      <Text style={styles.contentInfo}>Type: {item.type}</Text>
      <Text style={styles.contentInfo}>Size: {item.size} MB</Text>

      <Text style={styles.contentTitle}>{item.name || 'Untitled'}</Text>
      <Text style={styles.contentInfo}>Type: {item.type || 'Unknown'}</Text>
      <Text style={styles.contentInfo}>Size: {item.size || 0} MB</Text>
 
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteOfflineContent(item.id)}
      >
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const deleteOfflineContent = async (contentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/mobile/offline/${contentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Content deleted!');
        await loadOfflineContent();
      }
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🏛️ Parampara Mobile</Text>
          <Text style={styles.userId}>User: {userId}</Text>
          <Text style={styles.userId}>User: {userId || 'Loading...'}</Text>
          {deviceId && (
            <Text style={styles.userId}>Device: {deviceId.slice(0, 12)}...</Text>
          )}
        </View>

        {/* Location */}
        {location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationText}>📍 Location: {location.lat}, {location.lng}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, isRecording && styles.recordingButton]}
            onPress={recordAudio}
          >
            <Text style={styles.buttonText}>
              {isRecording ? '⏹️ Stop Recording' : '🎤 Record Audio'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={selectImage}
          >
            <Text style={styles.buttonText}>📸 Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}

            style={[styles.actionButton, syncStatus === 'syncing' && styles.syncingButton]}
            onPress={syncOfflineData}
          >
            <Text style={styles.buttonText}>
              {syncStatus === 'syncing' ? '🔄 Syncing...' : '🔄 Sync Data'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Offline Content</Text>
          <FlatList
            data={offlineContent}
            renderItem={renderOfflineContent}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No offline content</Text>
            }
          />

          <Text style={styles.sectionTitle}>📚 Offline Content ({offlineContent.length})</Text>
          {offlineContent.length > 0 ? (
            <FlatList
              data={offlineContent}
              renderItem={renderOfflineContent}
              keyExtractor={(item) => item.id || Math.random().toString()}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No offline content</Text>
          )}
        </View>

        {/* Sample Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Available Content</Text>
          <TouchableOpacity
            style={styles.contentCard}
            onPress={() => downloadContent('content_1')}
          >
            <Text style={styles.contentTitle}>Heritage Walk Tour</Text>
            <Text style={styles.contentInfo}>Download for offline use</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contentCard}
            onPress={() => downloadContent('content_2')}
          >
            <Text style={styles.contentTitle}>Cultural Story Collection</Text>
            <Text style={styles.contentInfo}>Download for offline use</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    padding: 20,
    backgroundColor: '#2E7D32',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5
  },
  locationCard: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    elevation: 2
  },
  locationText: {
    fontSize: 14,
    color: '#333'
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center'
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    margin: 5,
    minWidth: 120,
    alignItems: 'center'
  },
  recordingButton: {
    backgroundColor: '#f44336'
  },

  syncingButton: {
    backgroundColor: '#FF9800'
  },

  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500'
  },
  section: {
    padding: 15
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  contentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333'
  },
  contentInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 5
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center'
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    padding: 20
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;