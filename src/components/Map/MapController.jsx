import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';

export function MapController({
  target,
  setPosition,
  setZoom,
  setMouse,
  action,
  onMapClick,
  routePoints
}) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.lat, target.lng], target.zoom, { duration: 1.2 });
    }
  }, [target, map]);

  useEffect(() => {
    if (!action) return;
    if (action.type === 'in') map.zoomIn();
    if (action.type === 'out') map.zoomOut();
    if (action.type === 'reset') map.flyTo([-12, -60], 2, { duration: 1 });
  }, [action, map]);

  useEffect(() => {
    if (routePoints && routePoints.length >= 2) {
      const lats = routePoints.map((p) => p.lat);
      const lngs = routePoints.map((p) => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      // Fit if not crossing antimeridian widely
      if (Math.abs(maxLng - minLng) < 180) {
        map.fitBounds(
          [
            [minLat, minLng],
            [maxLat, maxLng]
          ],
          { padding: [50, 50], maxZoom: 8 }
        );
      }
    }
  }, [routePoints, map]);

  useMapEvents({
    click: (e) => onMapClick(e.latlng),
    move: () => {
      const c = map.getCenter();
      setPosition({ lat: c.lat, lng: ((((c.lng + 180) % 360) + 360) % 360) - 180 });
    },
    zoomend: () => setZoom(map.getZoom()),
    mousemove: (e) => setMouse(e.latlng),
    mouseout: () => setMouse(null)
  });

  return null;
}
