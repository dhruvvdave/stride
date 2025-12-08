import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { redirectToCheckout } from '../services/stripe';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  TruckIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const Premium = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isPremium = user?.subscription_status === 'active';

  const features = [
    {
      icon: BoltIcon,
      title: 'AI-Powered Route Optimization',
      description: 'Get the absolute smoothest routes with our advanced AI algorithms.',
    },
    {
      icon: TruckIcon,
      title: 'Unlimited Vehicle Profiles',
      description: 'Add as many vehicles as you want with custom clearance settings.',
    },
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Deep insights into your driving patterns and route quality.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Priority Support',
      description: 'Get help when you need it with dedicated premium support.',
    },
    {
      icon: StarIcon,
      title: 'No Advertisements',
      description: 'Enjoy a clean, ad-free experience across all platforms.',
    },
    {
      icon: SparklesIcon,
      title: 'Early Access',
      description: 'Be the first to try new features and improvements.',
    },
  ];

  const handleUpgrade = async () => {
    try {
      const priceId = import.meta.env.VITE_STRIPE_PRICE_ID || 'price_premium_monthly';
      await redirectToCheckout(priceId);
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
      console.error('Checkout error:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      await redirectToPortal();
    } catch (error) {
      toast.error('Failed to open subscription management. Please try again.');
      console.error('Portal error:', error);
    }
  };

  return (
    <Layout requireAuth={true}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-premium-main to-warning-main text-white px-6 py-2 rounded-full font-semibold mb-4">
            ⭐ Premium
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the full potential of Stride with exclusive premium features
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-md mx-auto mb-12">
          <Card padding="lg" className="border-2 border-primary-main">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Premium</h2>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$9.99</span>
                <span className="text-gray-600 ml-2">per month</span>
              </div>
              <p className="text-gray-600 mb-6">
                7-day free trial • Cancel anytime
              </p>
              {isPremium ? (
                <Button
                  onClick={handleManageSubscription}
                  variant="secondary"
                  fullWidth
                  size="lg"
                >
                  Manage Subscription
                </Button>
              ) : (
                <Button
                  onClick={handleUpgrade}
                  fullWidth
                  size="lg"
                >
                  Start Free Trial
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Premium Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} padding="lg">
                  <Icon className="h-12 w-12 text-primary-main mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your account settings.
                You'll continue to have access until the end of your billing period.
              </p>
            </Card>
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards and debit cards through our secure payment
                processor, Stripe.
              </p>
            </Card>
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes! All new Premium subscribers get a 7-day free trial. You won't be charged
                until the trial period ends.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Premium;
