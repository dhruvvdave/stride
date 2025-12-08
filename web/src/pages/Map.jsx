import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSelector, useDispatch } from 'react-redux';
import Layout from '../components/layout/Layout';
import ReportObstacleModal from '../components/reporting/ReportObstacleModal';
import { setCenter, setUserLocation } from '../store/slices/mapSlice';
import { openReportModal } from '../store/slices/obstacleSlice';
import Button from '../components/common/Button';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map center
function MapUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

const Map = () => {
  const dispatch = useDispatch();
  const { center, zoom, obstacles, userLocation } = useSelector((state) => state.map);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          dispatch(setUserLocation({ lat: latitude, lng: longitude }));
          dispatch(setCenter([latitude, longitude]));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [dispatch]);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    dispatch(openReportModal({ location: { lat, lng } }));
  };

  return (
    <Layout requireAuth={true}>
      <ReportObstacleModal />
      <div className="h-[calc(100vh-64px)] relative">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <input
              type="text"
              placeholder="Search for a place..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main"
            />
          </div>
        </div>

        {/* Report Button */}
        <div className="absolute bottom-8 right-4 z-[1000]">
          <Button
            onClick={() => dispatch(openReportModal({}))}
            size="lg"
            className="shadow-xl"
          >
            Report Obstacle
          </Button>
        </div>

        {/* Map */}
        <MapContainer
          center={center}
          zoom={zoom}
          className="h-full w-full"
          zoomControl={true}
          whenReady={() => setMapReady(true)}
        >
          <MapUpdater center={center} zoom={zoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {/* Obstacle Markers */}
          {obstacles.map((obstacle) => (
            <Marker
              key={obstacle.id}
              position={[obstacle.latitude, obstacle.longitude]}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-lg mb-1">{obstacle.type}</h3>
                  <p className="text-sm text-gray-600 mb-2">{obstacle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`
                      px-2 py-1 rounded text-xs font-semibold
                      ${obstacle.severity === 'high' ? 'bg-danger-lighter text-danger-dark' : ''}
                      ${obstacle.severity === 'medium' ? 'bg-warning-lighter text-warning-dark' : ''}
                      ${obstacle.severity === 'low' ? 'bg-success-lighter text-success-dark' : ''}
                    `}>
                      {obstacle.severity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {obstacle.votes || 0} votes
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </Layout>
  );
};

export default Map;
