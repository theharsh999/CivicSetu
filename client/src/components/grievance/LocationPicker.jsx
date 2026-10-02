import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

// Fix Leaflet's missing icon assets in bundlers by constructing SVG data URI icon
const customMarkerIcon = new L.DivIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="
    background-color: #0284c7;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 10px;
      height: 10px;
      background-color: white;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to handle user click on map to reposition marker
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to fly to new location when coordinates change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.flyTo([center.lat, center.lng], map.getZoom() || 14);
    }
  }, [center, map]);
  return null;
};

export const LocationPicker = ({
  lat = 19.0760,
  lng = 72.8777,
  onChange,
  readOnly = false,
  height = '320px',
  className = '',
}) => {
  const [position, setPosition] = useState({ lat, lng });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    setPosition({ lat, lng });
  }, [lat, lng]);

  const handleMapClick = (newLat, newLng) => {
    if (readOnly) return;
    const roundedLat = parseFloat(newLat.toFixed(6));
    const roundedLng = parseFloat(newLng.toFixed(6));
    setPosition({ lat: roundedLat, lng: roundedLng });
    onChange?.(roundedLat, roundedLng);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = parseFloat(pos.coords.latitude.toFixed(6));
        const currentLng = parseFloat(pos.coords.longitude.toFixed(6));
        setPosition({ lat: currentLat, lng: currentLng });
        onChange?.(currentLat, currentLng);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        setGeoError('Could not retrieve current location. Using map pin position.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-mono">
            <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>
              Lat: <strong>{position.lat}</strong>, Lng: <strong>{position.lng}</strong>
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetCurrentLocation}
            isLoading={geoLoading}
            leftIcon={<Navigation className="w-3.5 h-3.5" />}
          >
            Locate Me (GPS)
          </Button>
        </div>
      )}

      {geoError && (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          <span>{geoError}</span>
        </p>
      )}

      {/* Map Container */}
      <div
        className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[position.lat, position.lng]} icon={customMarkerIcon}>
            <Popup>
              <div className="text-xs">
                <strong>Incident Location</strong>
                <br />
                {position.lat}, {position.lng}
              </div>
            </Popup>
          </Marker>

          <MapRecenter center={position} />
          {!readOnly && <MapClickHandler onLocationSelect={handleMapClick} />}
        </MapContainer>

        {!readOnly && (
          <div className="absolute bottom-2.5 left-2.5 z-[400] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 shadow-sm pointer-events-none">
            Click map to reposition pin
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
