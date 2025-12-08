import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  MapIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  SparklesIcon,
  ChartBarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const features = [
    {
      icon: MapIcon,
      title: 'Smart Navigation',
      description: 'AI-powered routing that finds the smoothest paths by avoiding obstacles.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Community-Verified',
      description: 'Crowdsourced obstacle data verified by thousands of drivers.',
    },
    {
      icon: TruckIcon,
      title: 'Vehicle Profiles',
      description: 'Customize routes based on your vehicle clearance and suspension.',
    },
    {
      icon: ChartBarIcon,
      title: 'Route Analytics',
      description: 'Compare smoothness scores and choose the perfect route for your ride.',
    },
    {
      icon: UserGroupIcon,
      title: 'Car Clubs',
      description: 'Join communities of enthusiasts and share your favorite routes.',
    },
    {
      icon: SparklesIcon,
      title: 'Premium Features',
      description: 'Unlock AI optimization, unlimited vehicles, and advanced analytics.',
    },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic navigation',
        'View obstacles',
        'Report obstacles',
        'Save favorite routes',
        '1 vehicle profile',
      ],
      cta: 'Get Started',
      link: '/register',
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '$9.99',
      period: 'per month',
      features: [
        'Everything in Free',
        'AI-powered route optimization',
        'Unlimited vehicle profiles',
        'Advanced route analytics',
        'Priority support',
        'No ads',
      ],
      cta: 'Start Free Trial',
      link: '/premium',
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-main">Stride</span>
              <span className="ml-2 text-xl">🚗</span>
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link to="/app">
                  <Button>Go to App</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="text">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-lighter to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Navigate smarter.
              <br />
              <span className="text-primary-main">Drive smoother.</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Stride finds optimal routes by avoiding speed bumps, potholes, and rough roads.
              Perfect for lowered cars, sports cars, and anyone who values a smooth ride.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={isAuthenticated ? '/app' : '/register'}>
                <Button size="lg">
                  {isAuthenticated ? 'Open Map' : 'Get Started Free'}
                </Button>
              </Link>
              <a href="#features">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for a smooth ride
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for the smoothest driving experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                padding="lg"
                className={plan.highlighted ? 'border-2 border-primary-main' : ''}
              >
                {plan.highlighted && (
                  <div className="bg-primary-main text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600 ml-2">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <svg className="h-5 w-5 text-success-main mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to={plan.link}>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    fullWidth
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
