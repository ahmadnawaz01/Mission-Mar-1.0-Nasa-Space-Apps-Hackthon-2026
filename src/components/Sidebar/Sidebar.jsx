import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FASTAPI_URL } from '../../constants/api';
import { LayerList } from './LayerList';
import { PlacesList } from './PlacesList';

export function Sidebar({
  isOpen,
  selectedLayer,
  onSelectLayer,
  onSelectPlace
}) {
  return (
    <aside className={'sidebar ' + (!isOpen ? 'collapsed' : '')}>
      <div className="side-inner">
        <div className="side-heading">
          <div>
            <div className="eyebrow"><span className="orange-dot" /> THE RED PLANET</div>
            <h1>Explore Mars<span>.</span></h1>
            <p>Discover the surface of our<br />neighboring world.</p>
          </div>
          <div className="planet-icon"><div /></div>
        </div>

        <div className="section-divider" />
        <LayerList
          selectedLayer={selectedLayer}
          onSelectLayer={onSelectLayer}
        />

        <div className="section-divider" />
        <PlacesList onSelectPlace={onSelectPlace} />

        <div className="sidebar-footer">
          <div className="status"><span className="live-dot" /> FASTAPI: {FASTAPI_URL}</div>
          <a
            href="https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars"
            target="_blank"
            rel="noreferrer"
          >
            About data <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </aside>
  );
}
