import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Bars3Icon, UserCircleIcon } from '@heroicons/react/24/outline';

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Menu */}
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={onMenuClick}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            )}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-main">Stride</span>
              <span className="ml-2 text-xl">🚗</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              <>
                <Link to="/landing" className="text-gray-700 hover:text-primary-main transition-colors">
                  About
                </Link>
                <Link to="/login" className="text-gray-700 hover:text-primary-main transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-main text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-700 hover:text-primary-main transition-colors">
                  Map
                </Link>
                <Link to="/community" className="text-gray-700 hover:text-primary-main transition-colors">
                  Community
                </Link>
                <Link to="/premium" className="text-primary-main font-semibold hover:text-primary-dark transition-colors">
                  Premium
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-primary-main transition-colors">
                    <UserCircleIcon className="h-8 w-8" />
                    <span className="ml-2">{user?.name || 'User'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
