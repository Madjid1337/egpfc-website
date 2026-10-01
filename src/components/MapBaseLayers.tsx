import { LayersControl, TileLayer } from 'react-leaflet';
import { SATELLITE_TILE, STREET_TILE } from '@/lib/mapTiles';

/** Satellite / Street switcher + zoomable tile layers */
export default function MapBaseLayers({
  defaultMode = 'satellite',
}: {
  defaultMode?: 'satellite' | 'street';
}) {
  return (
    <LayersControl position="topright">
      <LayersControl.BaseLayer
        checked={defaultMode === 'satellite'}
        name="Satellite"
      >
        <TileLayer
          attribution={SATELLITE_TILE.attribution}
          url={SATELLITE_TILE.url}
          maxNativeZoom={SATELLITE_TILE.maxNativeZoom}
          maxZoom={SATELLITE_TILE.maxZoom}
        />
      </LayersControl.BaseLayer>
      <LayersControl.BaseLayer
        checked={defaultMode === 'street'}
        name="Street"
      >
        <TileLayer
          attribution={STREET_TILE.attribution}
          url={STREET_TILE.url}
          maxNativeZoom={STREET_TILE.maxNativeZoom}
          maxZoom={STREET_TILE.maxZoom}
        />
      </LayersControl.BaseLayer>
    </LayersControl>
  );
}
