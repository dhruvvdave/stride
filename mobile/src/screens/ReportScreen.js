import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Card from '../components/Common/Card';
import {
  setObstacleType,
  setObstacleSeverity,
  setPhoto,
  setDescription,
  reportObstacle,
  resetReporting,
} from '../store/slices/obstacleSlice';
import { uploadImage } from '../services/uploadService';
import {
  COLORS,
  OBSTACLE_TYPES,
  OBSTACLE_SEVERITY,
} from '../config/constants';

const ReportScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { selectedType, selectedSeverity, photo, description, loading } =
    useSelector((state) => state.obstacle);
  const { userLocation } = useSelector((state) => state.map);

  const obstacleTypes = [
    { id: OBSTACLE_TYPES.SPEED_BUMP, label: 'Speed Bump', icon: 'speed' },
    { id: OBSTACLE_TYPES.POTHOLE, label: 'Pothole', icon: 'warning' },
    { id: OBSTACLE_TYPES.ROUGH_ROAD, label: 'Rough Road', icon: 'texture' },
    { id: OBSTACLE_TYPES.CONSTRUCTION, label: 'Construction', icon: 'construction' },
    { id: OBSTACLE_TYPES.OTHER, label: 'Other', icon: 'more-horiz' },
  ];

  const severityLevels = [
    { id: OBSTACLE_SEVERITY.LOW, label: 'Low', color: COLORS.success },
    { id: OBSTACLE_SEVERITY.MEDIUM, label: 'Medium', color: COLORS.warning },
    { id: OBSTACLE_SEVERITY.HIGH, label: 'High', color: COLORS.danger },
  ];

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Camera permission is required',
      });
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Camera Error',
            text2: response.errorMessage,
          });
          return;
        }
        if (response.assets && response.assets[0]) {
          dispatch(setPhoto(response.assets[0].uri));
        }
      }
    );
  };

  const handleChoosePhoto = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: response.errorMessage,
          });
          return;
        }
        if (response.assets && response.assets[0]) {
          dispatch(setPhoto(response.assets[0].uri));
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedType || !selectedSeverity) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please select obstacle type and severity',
      });
      return;
    }

    if (!userLocation) {
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your location',
      });
      return;
    }

    try {
      let photoUrl = null;
      if (photo) {
        photoUrl = await uploadImage(photo);
      }

      await dispatch(
        reportObstacle({
          type: selectedType,
          severity: selectedSeverity,
          description,
          photo: photoUrl,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        })
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Obstacle Reported',
        text2: 'Thank you for helping the community!',
      });

      dispatch(resetReporting());
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Report Failed',
        text2: error || 'Please try again',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Obstacle</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Obstacle Type</Text>
          <View style={styles.typeGrid}>
            {obstacleTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  selectedType === type.id && styles.typeButtonSelected,
                ]}
                onPress={() => dispatch(setObstacleType(type.id))}
              >
                <Icon
                  name={type.icon}
                  size={32}
                  color={
                    selectedType === type.id ? COLORS.primary : '#757575'
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    selectedType === type.id && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Severity</Text>
          <View style={styles.severityRow}>
            {severityLevels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.severityButton,
                  {
                    borderColor: level.color,
                    backgroundColor:
                      selectedSeverity === level.id ? level.color : '#FFFFFF',
                  },
                ]}
                onPress={() => dispatch(setObstacleSeverity(level.id))}
              >
                <Text
                  style={[
                    styles.severityLabel,
                    {
                      color:
                        selectedSeverity === level.id ? '#FFFFFF' : level.color,
                    },
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Photo (Optional)</Text>
          {photo ? (
            <View>
              <Image source={{ uri: photo }} style={styles.photoPreview} />
              <Button
                title="Change Photo"
                onPress={handleChoosePhoto}
                variant="secondary"
                size="small"
              />
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <Button
                title="Take Photo"
                onPress={handleTakePhoto}
                variant="secondary"
                style={styles.photoButton}
              />
              <Button
                title="Choose from Gallery"
                onPress={handleChoosePhoto}
                variant="secondary"
                style={styles.photoButton}
              />
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Description (Optional)</Text>
          <Input
            value={description}
            onChangeText={(text) => dispatch(setDescription(text))}
            placeholder="Add any additional details..."
            multiline
            numberOfLines={4}
          />
        </Card>

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  typeButton: {
    width: '30%',
    margin: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  typeLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  severityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  severityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photoButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default ReportScreen;
