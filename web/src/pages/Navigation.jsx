import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { stopNavigation, nextStep, previousStep } from '../store/slices/routeSlice';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedRoute, currentStep, isNavigating } = useSelector((state) => state.route);

  const handleStopNavigation = () => {
    dispatch(stopNavigation());
    navigate('/');
  };

  if (!selectedRoute || !isNavigating) {
    return (
      <Layout requireAuth={false}>
        <div className="p-6 max-w-7xl mx-auto">
          <Card padding="lg">
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No active navigation</p>
              <Button onClick={() => navigate('/')}>
                Back to Map
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentInstruction = selectedRoute.steps?.[currentStep];
  const nextInstruction = selectedRoute.steps?.[currentStep + 1];

  return (
    <Layout requireAuth={false}>
      <div className="h-[calc(100vh-64px)] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedRoute.destination_name || 'Destination'}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedRoute.distance} km • {selectedRoute.duration} min
              </p>
            </div>
            <Button variant="danger" onClick={handleStopNavigation}>
              <XMarkIcon className="h-5 w-5 mr-2" />
              End Navigation
            </Button>
          </div>
        </div>

        {/* Current Instruction */}
        <div className="bg-primary-lighter p-8 text-center">
          <div className="text-6xl mb-4">
            {currentInstruction?.icon || '➡️'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentInstruction?.instruction || 'Continue straight'}
          </h1>
          <p className="text-xl text-gray-700">
            {currentInstruction?.distance || '500 m'}
          </p>
        </div>

        {/* Next Instruction */}
        {nextInstruction && (
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="max-w-7xl mx-auto flex items-center">
              <span className="text-2xl mr-4">{nextInstruction.icon || '➡️'}</span>
              <div>
                <p className="text-sm text-gray-600">Then</p>
                <p className="font-medium text-gray-900">{nextInstruction.instruction}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map placeholder */}
        <div className="flex-1 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-600">Map view would be displayed here</p>
        </div>

        {/* Controls */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Button
              variant="secondary"
              onClick={() => dispatch(previousStep())}
              disabled={currentStep === 0}
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Previous
            </Button>
            <div className="text-gray-600">
              Step {currentStep + 1} of {selectedRoute.steps?.length || 0}
            </div>
            <Button
              variant="secondary"
              onClick={() => dispatch(nextStep())}
              disabled={currentStep >= (selectedRoute.steps?.length || 0) - 1}
            >
              Next
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Navigation;
