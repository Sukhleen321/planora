import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export default function MapView({ itinerary }) {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  const allPlaces = itinerary?.days?.flatMap(day =>
    day.slots
      .filter(s => s.place && s.place.coordinates && s.place.coordinates.lat && s.place.coordinates.lng)
      .map(s => ({
        ...s.place,
        time: s.time,
        dayNumber: day.dayNumber
      }))
  ) || [];

  const center = allPlaces.length > 0
    ? [
        allPlaces.reduce((s, p) => s + Number(p.coordinates.lat), 0) / allPlaces.length,
        allPlaces.reduce((s, p) => s + Number(p.coordinates.lng), 0) / allPlaces.length
      ]
    : [20.5937, 78.9629];

  return (
    <MapContainer 
      center={center} 
      zoom={12} 
      style={{ height: '350px', borderRadius: '12px', zIndex: 10 }}
    >
      <TileLayer 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
      />
      {allPlaces.map((place, i) => (
        <Marker key={i} position={[Number(place.coordinates.lat), Number(place.coordinates.lng)]}>
          <Popup>
            <div style={{ fontFamily: 'var(--font)' }}>
              <strong style={{ color: 'var(--bg-primary)' }}>{place.name}</strong><br/>
              <span style={{ color: '#475569', fontSize: '12px', fontWeight: '500' }}>
                Day {place.dayNumber} — {place.time}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
