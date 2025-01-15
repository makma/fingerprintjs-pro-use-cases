'use client';

import { FunctionComponent } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';

import React from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { env } from '../../../env';

// This is a workaround for the marker icon not showing up out of the box
const DefaultIcon = L.divIcon({
  html: `<svg width="30" height="30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 30 30">
          <circle cx="15" cy="15" r="15" fill="#FF5D22" opacity="0.5"/>
          <circle cx="15" cy="15" r="7" fill="#FF5D22"/>
        </svg>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  // Necessary to prevent default border and background of .leaflet-div-icon
  className: 'playground-map-marker',
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapProps = {
  position: [number, number];
  height?: string;
  width?: string;
  zoom?: number;
};

const MAPBOX_ACCESS_TOKEN = env.NEXT_PUBLIC_MAPBOX_API_TOKEN;

export const Map: FunctionComponent<MapProps> = (props) => {
  const defaultZoom = 9; // Shows you roughly inside a specific city
  return (
    <MapContainer
      center={props.position}
      zoom={props.zoom ?? defaultZoom}
      style={{
        height: props.height ?? '200px',
        width: props.width ?? '100%',
        borderRadius: '4px',
        border: '1px solid #E8E8E8',
      }}
      dragging={false}
      zoomControl={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`}
        id='mapbox/light-v11'
        tileSize={512}
        zoomOffset={-1}
      />
      <Marker position={props.position} icon={DefaultIcon} interactive={false} />
    </MapContainer>
  );
};

export default Map;
