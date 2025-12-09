import React from 'react';
import { useSelector } from 'react-redux';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const RouteResult = () => {
  const navigate = useNavigate();
  const { routes, selectedRoute } = useSelector((state) => state.route);

  const handleStartNavigation = () => {
    navigate('/navigate');
  };

  return (
    <Layout requireAuth={false}>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Route Comparison</h1>

        {routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {routes.map((route, index) => (
              <Card
                key={index}
                padding="lg"
                className={`${
                  selectedRoute?.id === route.id ? 'border-2 border-primary-main' : ''
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {route.type === 'smooth' && '🌟 Smooth Route'}
                    {route.type === 'standard' && '🚗 Standard Route'}
                    {route.type === 'fastest' && '⚡ Fastest Route'}
                  </h3>
                  <p className="text-sm text-gray-600">{route.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-semibold">{route.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{route.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Smoothness:</span>
                    <span className="font-semibold">{route.smoothness_score}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Obstacles:</span>
                    <span className="font-semibold">{route.obstacles_count || 0}</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant={selectedRoute?.id === route.id ? 'primary' : 'secondary'}
                  onClick={handleStartNavigation}
                >
                  {selectedRoute?.id === route.id ? 'Start Navigation' : 'Select Route'}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No routes available</p>
              <Button onClick={() => navigate('/')}>
                Back to Map
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default RouteResult;
