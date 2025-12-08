import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Card from '../components/Common/Card';
import { addVehicle, updateVehicle } from '../store/slices/userSlice';
import { createVehicle, updateVehicle as updateVehicleAPI } from '../services/userService';
import { COLORS } from '../config/constants';

const VehicleFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const existingVehicle = route.params?.vehicle;
  const isEdit = !!existingVehicle;

  const [formData, setFormData] = useState({
    name: existingVehicle?.name || '',
    year: existingVehicle?.year || '',
    make: existingVehicle?.make || '',
    model: existingVehicle?.model || '',
    type: existingVehicle?.type || 'sedan',
    clearance: existingVehicle?.clearance || '',
    suspension: existingVehicle?.suspension || 'standard',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const vehicleTypes = [
    { id: 'sedan', label: 'Sedan', icon: 'directions-car' },
    { id: 'suv', label: 'SUV', icon: 'airport-shuttle' },
    { id: 'truck', label: 'Truck', icon: 'local-shipping' },
    { id: 'sports', label: 'Sports Car', icon: 'sports-score' },
    { id: 'motorcycle', label: 'Motorcycle', icon: 'two-wheeler' },
  ];

  const suspensionTypes = [
    { id: 'standard', label: 'Standard' },
    { id: 'sport', label: 'Sport' },
    { id: 'comfort', label: 'Comfort' },
    { id: 'offroad', label: 'Off-Road' },
  ];

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.year) newErrors.year = 'Year is required';
    if (!formData.make) newErrors.make = 'Make is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!formData.clearance) newErrors.clearance = 'Ground clearance is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEdit) {
        const updatedVehicle = await updateVehicleAPI(existingVehicle.id, formData);
        dispatch(updateVehicle(updatedVehicle));
        Toast.show({
          type: 'success',
          text1: 'Vehicle Updated',
          text2: 'Your vehicle has been updated successfully',
        });
      } else {
        const newVehicle = await createVehicle(formData);
        dispatch(addVehicle(newVehicle));
        Toast.show({
          type: 'success',
          text1: 'Vehicle Added',
          text2: 'Your vehicle has been added successfully',
        });
      }
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to save vehicle',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <Input
            label="Vehicle Name"
            value={formData.name}
            onChangeText={(value) => updateField('name', value)}
            placeholder="My Car"
            error={errors.name}
          />
          <Input
            label="Year"
            value={formData.year}
            onChangeText={(value) => updateField('year', value)}
            placeholder="2023"
            keyboardType="numeric"
            error={errors.year}
          />
          <Input
            label="Make"
            value={formData.make}
            onChangeText={(value) => updateField('make', value)}
            placeholder="Toyota"
            error={errors.make}
          />
          <Input
            label="Model"
            value={formData.model}
            onChangeText={(value) => updateField('model', value)}
            placeholder="Camry"
            error={errors.model}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <View style={styles.typeGrid}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  formData.type === type.id && styles.typeButtonSelected,
                ]}
                onPress={() => updateField('type', type.id)}
              >
                <Icon
                  name={type.icon}
                  size={32}
                  color={
                    formData.type === type.id ? COLORS.primary : '#757575'
                  }
                />
                <Text
                  style={[
                    styles.typeLabel,
                    formData.type === type.id && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Specifications</Text>
          <Input
            label="Ground Clearance (inches)"
            value={formData.clearance}
            onChangeText={(value) => updateField('clearance', value)}
            placeholder="5.5"
            keyboardType="decimal-pad"
            error={errors.clearance}
          />

          <Text style={styles.fieldLabel}>Suspension Type</Text>
          <View style={styles.suspensionRow}>
            {suspensionTypes.map((suspension) => (
              <TouchableOpacity
                key={suspension.id}
                style={[
                  styles.suspensionButton,
                  formData.suspension === suspension.id &&
                    styles.suspensionButtonSelected,
                ]}
                onPress={() => updateField('suspension', suspension.id)}
              >
                <Text
                  style={[
                    styles.suspensionText,
                    formData.suspension === suspension.id &&
                      styles.suspensionTextSelected,
                  ]}
                >
                  {suspension.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Button
          title={isEdit ? 'Update Vehicle' : 'Add Vehicle'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
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
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
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
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  suspensionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  suspensionButton: {
    flex: 1,
    minWidth: '45%',
    margin: 4,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  suspensionButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  suspensionText: {
    fontSize: 14,
    color: '#757575',
  },
  suspensionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default VehicleFormScreen;
