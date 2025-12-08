import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { fetchUserStats, fetchAchievements } from '../store/slices/userSlice';
import { TrophyIcon, MapIcon, FlagIcon, StarIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { stats, achievements, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUserStats());
    dispatch(fetchAchievements());
  }, [dispatch]);

  if (loading) {
    return (
      <Layout requireAuth={true}>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const statCards = [
    {
      icon: MapIcon,
      title: 'Distance Traveled',
      value: `${stats?.total_distance || 0} km`,
      color: 'text-primary-main',
    },
    {
      icon: FlagIcon,
      title: 'Obstacles Reported',
      value: stats?.obstacles_reported || 0,
      color: 'text-warning-main',
    },
    {
      icon: StarIcon,
      title: 'Points Earned',
      value: stats?.total_points || 0,
      color: 'text-premium-main',
    },
    {
      icon: TrophyIcon,
      title: 'Achievements',
      value: achievements?.length || 0,
      color: 'text-success-main',
    },
  ];

  return (
    <Layout requireAuth={true}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8">
          <Card padding="lg">
            <div className="flex items-center">
              <div className="h-24 w-24 rounded-full bg-primary-lighter flex items-center justify-center text-4xl font-bold text-primary-main">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
                <div className="mt-2">
                  <span className={`
                    px-3 py-1 rounded-full text-sm font-semibold
                    ${user?.subscription_status === 'active'
                      ? 'bg-premium-main text-white'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {user?.subscription_status === 'active' ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} padding="lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Icon className={`h-12 w-12 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements && achievements.length > 0 ? (
              achievements.map((achievement) => (
                <Card key={achievement.id} padding="md">
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{achievement.icon || '🏆'}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card padding="lg" className="col-span-full">
                <div className="text-center text-gray-600 py-8">
                  <TrophyIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p>No achievements yet. Start driving to earn badges!</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
