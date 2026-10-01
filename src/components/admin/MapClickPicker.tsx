import { useMapEvents } from 'react-leaflet';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const pinIcon = new L.DivIcon({
  className: 'admin-map-pin',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#B89555;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function MapClickPicker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (coords: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      onChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  if (!position) return null;
  return <Marker position={position} icon={pinIcon} />;
}
