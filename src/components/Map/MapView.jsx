import React from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { PanelLeftClose, PanelLeftOpen, Globe2, Info, Crosshair } from 'lucide-react';
import { places } from '../../constants/places';
import { coord, splitRoute, getVerdictStyle } from '../../utils/geo';
import { landmarkIcon, routeIcon } from '../../utils/icons';
import { MapController } from './MapController';
import { SearchBar } from './SearchBar';
import { InfoModal } from './InfoModal';
import { MapControls } from './MapControls';
import { MapBottomBar } from './MapBottomBar';

export function MapView({
  selectedLayer,
  sidebarOpen,
  onToggleSidebar,
  target,
  position,
  setPosition,
  zoom,
  setZoom,
  mouse,
  setMouse,
  action,
  onCommand,
  onSelectPlace,
  onMapClick,
  source,
  destination,
  route,
  selecting,
  onCancelSelecting,
  onSetPresetPoint,
  infoOpen,
  onToggleInfo
}) {
  const waypoints = route ? route.waypoints || route.coordinates || [] : [];
  const verdictMeta = route ? getVerdictStyle(route.verdict) : null;

  return (
    <main className={'map-area ' + (selecting ? 'selecting-map' : '')}>
      <MapContainer
        center={[-12, -60]}
        zoom={2}
        minZoom={2}
        maxZoom={12}
        crs={L.CRS.EPSG4326}
        zoomControl={false}
        attributionControl={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        className="map"
      >
        <TileLayer
          key={selectedLayer.id}
          url={selectedLayer.url}
          opacity={1}
          noWrap={true}
          maxNativeZoom={selectedLayer.maxNativeZoom || 7}
          maxZoom={14}
          bounds={selectedLayer.bounds || [[-90, -180], [90, 180]]}
        />

        {/* Landmark Exploration Markers */}
        {places.map((p) => (
          <Marker
            key={p.name}
            position={[p.lat, p.lng]}
            icon={landmarkIcon(p.name)}
            title={p.name}
          >
            <Popup>
              <div className="landmark-popup">
                <span>{p.type}</span>
                <strong>{p.name}</strong>
                <p>{p.description}</p>
                <small>
                  {coord(p.lat, 'N', 'S')} / {coord(p.lng, 'E', 'W')}
                </small>
                <div className="popup-route-actions">
                  <button onClick={() => onSetPresetPoint('source', { lat: p.lat, lng: p.lng })}>
                    Set as Start (A)
                  </button>
                  <button onClick={() => onSetPresetPoint('destination', { lat: p.lat, lng: p.lng })}>
                    Set as Dest (B)
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Source and Destination Markers */}
        {source && (
          <Marker
            position={[source.lat, source.lng]}
            icon={routeIcon('A', '#10b981')}
            title="Source"
          />
        )}
        {destination && (
          <Marker
            position={[destination.lat, destination.lng]}
            icon={routeIcon('B', '#f43f5e')}
            title="Destination"
          />
        )}

        {/* Route Polyline (split across antimeridian) */}
        {waypoints.length > 0 &&
          splitRoute(waypoints).map((segment, i) => (
            <Polyline
              key={i}
              positions={segment}
              pathOptions={{
                color: verdictMeta?.color || '#ffb77e',
                weight: 4,
                opacity: 0.95,
                dashArray: route?.verdict === 'NO-GO' ? '6, 6' : undefined
              }}
            />
          ))}

        <MapController
          target={target}
          setPosition={setPosition}
          setZoom={setZoom}
          setMouse={setMouse}
          action={action}
          onMapClick={onMapClick}
          routePoints={waypoints}
        />
      </MapContainer>

      {/* Floating Top Controls: Sidebar Toggle, Search Bar, Projection Pill */}
      <div className="map-top">
        <button
          className="icon-btn sidebar-toggle"
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <SearchBar onSelectPlace={onSelectPlace} />

        <div className="map-top-right">
          <span className="projection">
            <Globe2 size={14} /> EQUIRECTANGULAR <span>·</span> EPSG:4326
          </span>
          <button
            className="icon-btn"
            title="About this map"
            onClick={onToggleInfo}
          >
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* Info Modal */}
      <InfoModal isOpen={infoOpen} onClose={onToggleInfo} />

      {/* Selecting Target Prompt Notice */}
      {selecting && (
        <div className="map-select-notice">
          <Crosshair size={15} />
          <span>
            Click the map to set your{' '}
            {selecting === 'source' ? 'start point' : 'destination'}
          </span>
          <button onClick={onCancelSelecting}>Cancel</button>
        </div>
      )}


      {/* Map Zoom & Reset Controls */}
      <MapControls onCommand={onCommand} />

      {/* Coordinates & Credit Bar */}
      <MapBottomBar mouse={mouse} position={position} zoom={zoom} />
    </main>
  );
}
