import { FASTAPI_URL } from '../constants/api';

export async function calculateRoutePlan({ source, destination, mode }) {
  const payload = {
    start: [Number(source.lat), Number(source.lng)],
    end: [Number(destination.lat), Number(destination.lng)],
    mode: mode
  };

  let response;
  try {
    response = await fetch(`${FASTAPI_URL}/api/plan-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // Fallback to relative endpoint proxied through Vite
    response = await fetch('/api/plan-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.detail ||
      data.reason ||
      data.error ||
      `FastAPI server returned status ${response.status}`
    );
  }

  const waypoints = data.waypoints || data.coordinates;
  if (!Array.isArray(waypoints) || waypoints.length === 0) {
    throw new Error('Routing engine returned no coordinate waypoints.');
  }

  return data;
}
