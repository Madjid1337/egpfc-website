export const MAP_MAX_ZOOM = 22;

export const SATELLITE_TILE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxNativeZoom: 19,
  maxZoom: MAP_MAX_ZOOM,
} as const;

export const STREET_TILE = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  attribution:
    'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, TomTom',
  maxNativeZoom: 19,
  maxZoom: MAP_MAX_ZOOM,
} as const;
