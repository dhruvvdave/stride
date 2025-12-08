import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import Card from '../components/Common/Card';
import { logout, updateUser } from '../store/slices/authSlice';
import { COLORS } from '../config/constants';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSaveProfile = () => {
    dispatch(updateUser({ name, email }));
    Toast.show({
      type: 'success',
      text1: 'Profile Updated',
      text2: 'Your changes have been saved',
    });
  };

  const handleLogout = () => {
    dispatch(logout());
    Toast.show({
      type: 'success',
      text1: 'Logged Out',
      text2: 'See you soon!',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Input
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
          />
          <Button
            title="Save Changes"
            onPress={handleSaveProfile}
            style={styles.saveButton}
          />
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="notifications" size={24} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive alerts about obstacles
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Icon name="location-on" size={24} color={COLORS.primary} />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Sharing</Text>
                <Text style={styles.settingDescription}>
                  Share location for better routes
                </Text>
              </View>
            </View>
            <Switch
              value={locationSharing}
              onValueChange={setLocationSharing}
              trackColor={{ false: '#E0E0E0', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Icon name="info" size={24} color="#757575" />
            <Text style={styles.menuText}>About Stride</Text>
            <Icon name="chevron-right" size={24} color="#9E9E9E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="description" size={24} color="#757575" />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Icon name="chevron-right" size={24} color="#9E9E9E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="privacy-tip" size={24} color="#757575" />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color="#9E9E9E" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Icon name="help" size={24} color="#757575" />
            <Text style={styles.menuText}>Help & Support</Text>
            <Icon name="chevron-right" size={24} color="#9E9E9E" />
          </TouchableOpacity>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </Card>

        <Button
          title="Log Out"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
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
  saveButton: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#757575',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 12,
  },
  versionText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});

export default SettingsScreen;
