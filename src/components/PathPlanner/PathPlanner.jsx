import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { RoutePoints } from './RoutePoints';
import { TraverseProfile } from './TraverseProfile';
import { RouteResults } from './RouteResults';

export function PathPlanner({
  source,
  destination,
  selecting,
  onToggleSelecting,
  mode,
  onSelectMode,
  onCalculate,
  onClear,
  calculating,
  route,
  routeError
}) {
  const isCalculateDisabled = !source || !destination || calculating;
  const isClearDisabled = calculating || (!source && !destination && !route && !selecting);

  return (
    <section id="path-planner" className="route-panel" aria-label="Path planner">
      <div className="route-heading">
        <div>
          <span className="route-kicker">INTERPLANETARY EVA & TRAVERSE</span>
          <h3>Path Planner</h3>
        </div>
        <button
          className="route-clear"
          onClick={onClear}
          disabled={isClearDisabled}
          title="Clear path"
        >
          Clear
        </button>
      </div>

      <p className="route-intro">Select start and destination on the map.</p>

      {/* Source & Destination Buttons */}
      <RoutePoints
        source={source}
        destination={destination}
        selecting={selecting}
        onToggleSelecting={onToggleSelecting}
        disabled={calculating}
      />

      {/* Traverse Profile (Safest, Fastest, Science) */}
      <TraverseProfile
        mode={mode}
        onSelectMode={onSelectMode}
        disabled={calculating}
      />

      {/* Calculate CTA */}
      <button
        className="calculate-btn"
        onClick={onCalculate}
        disabled={isCalculateDisabled}
      >
        {calculating ? 'Computing Traversal…' : 'Calculate Route'}{' '}
        <ArrowUpRight size={15} />
      </button>

      {/* Error Output */}
      {routeError && (
        <p className="route-error" role="alert">
          {routeError}
        </p>
      )}

      {/* Calculated Route Telemetry */}
      <RouteResults route={route} />

      <p className="route-note">Bio-energetic A* terrain-aware pathfinding · FastAPI</p>
    </section>
  );
}
