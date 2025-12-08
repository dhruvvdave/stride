import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Card from '../Common/Card';
import { COLORS } from '../../config/constants';

const VehicleCard = ({ vehicle, onEdit, onDelete }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="directions-car" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{vehicle.name}</Text>
          <Text style={styles.details}>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Icon name="edit" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Icon name="delete" size={20} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.specs}>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Type</Text>
          <Text style={styles.specValue}>{vehicle.type}</Text>
        </View>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Clearance</Text>
          <Text style={styles.specValue}>{vehicle.clearance}"</Text>
        </View>
        <View style={styles.spec}>
          <Text style={styles.specLabel}>Suspension</Text>
          <Text style={styles.specValue}>{vehicle.suspension}</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#757575',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  spec: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
});

export default VehicleCard;
