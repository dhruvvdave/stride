import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { COLORS } from '../config/constants';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// Main Screens
import MapScreen from '../screens/MapScreen';
import CommunityScreen from '../screens/CommunityScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Modal Screens
import SearchScreen from '../screens/SearchScreen';
import RouteResultScreen from '../screens/RouteResultScreen';
import NavigationScreen from '../screens/NavigationScreen';
import ReportScreen from '../screens/ReportScreen';
import PremiumScreen from '../screens/PremiumScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VehicleFormScreen from '../screens/VehicleFormScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Map') {
          iconName = 'map';
        } else if (route.name === 'Community') {
          iconName = 'people';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#757575',
      tabBarStyle: {
        paddingBottom: 5,
        paddingTop: 5,
        height: 60,
      },
    })}
  >
    <Tab.Screen name="Map" component={MapScreen} />
    <Tab.Screen name="Community" component={CommunityScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="RouteResult"
              component={RouteResultScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Navigation"
              component={NavigationScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="Report"
              component={ReportScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Premium"
              component={PremiumScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="VehicleForm"
              component={VehicleFormScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
