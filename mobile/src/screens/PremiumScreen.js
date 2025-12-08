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
import Toast from 'react-native-toast-message';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import { COLORS } from '../config/constants';

const PremiumScreen = ({ navigation }) => {
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  const features = [
    {
      icon: 'directions-car',
      title: 'Vehicle Profiles',
      description: 'Create custom profiles for multiple vehicles',
    },
    {
      icon: 'psychology',
      title: 'AI Obstacle Detection',
      description: 'Automatic detection using phone sensors',
    },
    {
      icon: 'analytics',
      title: 'Advanced Analytics',
      description: 'Detailed insights about your driving',
    },
    {
      icon: 'cloud-download',
      title: 'Unlimited Offline Maps',
      description: 'Download maps for offline navigation',
    },
    {
      icon: 'priority-high',
      title: 'Priority Support',
      description: 'Get help faster with premium support',
    },
    {
      icon: 'block',
      title: 'Ad-Free Experience',
      description: 'Enjoy Stride without any ads',
    },
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$4.99',
      period: '/month',
      savings: null,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '$39.99',
      period: '/year',
      savings: 'Save 33%',
    },
  ];

  const handleSubscribe = async () => {
    try {
      // TODO: Implement IAP subscription
      Toast.show({
        type: 'info',
        text1: 'Coming Soon',
        text2: 'In-app purchases will be available soon!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Subscription Failed',
        text2: error.message || 'Please try again',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Stride Premium</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <View style={styles.crownContainer}>
            <Icon name="workspace-premium" size={64} color="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>Upgrade to Premium</Text>
          <Text style={styles.heroSubtitle}>
            Unlock all features and enhance your navigation experience
          </Text>
        </View>

        <View style={styles.planSelector}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.savings && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsText}>{plan.savings}</Text>
                </View>
              )}
              <Text style={styles.planName}>{plan.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              {selectedPlan === plan.id && (
                <Icon
                  name="check-circle"
                  size={24}
                  color={COLORS.success}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Icon name={feature.icon} size={28} color={COLORS.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Subscription automatically renews unless auto-renew is turned off at
            least 24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Subscribe - ${
            plans.find((p) => p.id === selectedPlan)?.price
          }`}
          onPress={handleSubscribe}
          style={styles.subscribeButton}
        />
        <TouchableOpacity style={styles.restoreButton}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 120,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  crownContainer: {
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  planSelector: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  planPeriod: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 2,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#757575',
  },
  disclaimer: {
    paddingHorizontal: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subscribeButton: {
    marginBottom: 8,
  },
  restoreButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  restoreText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PremiumScreen;
