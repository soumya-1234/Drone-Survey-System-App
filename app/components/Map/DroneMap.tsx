"use client";

import { useEffect, useRef, useState } from 'react';
import { Coordinate, Waypoint } from '../../types/mission';
import dynamic from 'next/dynamic';
import type { Map as LeafletMap, LatLngExpression, LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

interface DroneMapProps {
  waypoints?: Waypoint[];
  center?: Coordinate;
  zoom?: number;
  onAreaSelect?: (coordinates: Coordinate[]) => void;
  onWaypointAdd?: (waypoint: Coordinate) => void;
}

// Dynamically import Leaflet with no SSR
const DroneMapComponent = dynamic(() => Promise.resolve(DroneMapInner), {
  ssr: false,
});

function DroneMapInner({ 
  waypoints = [], 
  center = { lat: 37.7749, lng: -122.4194 }, 
  zoom = 13,
  onAreaSelect,
  onWaypointAdd
}: DroneMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const drawControlRef = useRef<any>(null);
  const [flightPath, setFlightPath] = useState<any>(null);
  const [surveyArea, setSurveyArea] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [waypointsState, setWaypointsState] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Import Leaflet and Leaflet Draw dynamically
    const L = require('leaflet');
    require('leaflet-draw');
    
    if (!mapRef.current) {
      const map = L.map('map').setView([center.lat, center.lng], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' OpenStreetMap contributors'
      }).addTo(map);

      // Create feature group for drawn items
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Initialize drawing controls with custom styles
      const drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: true,
            shapeOptions: {
              color: '#2563eb',
              fillColor: '#3b82f6',
              fillOpacity: 0.2
            }
          },
          circle: false,
          circlemarker: false,
          rectangle: false,
          polyline: {
            shapeOptions: {
              color: '#16a34a',
              weight: 3
            }
          },
          marker: {
            icon: L.icon({
              iconUrl: '/marker-icon.png',
              shadowUrl: '/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })
          }
        },
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });

      map.addControl(drawControl);
      drawControlRef.current = drawControl;
      mapRef.current = map;

      // Handle draw events
      map.on('draw:created', (e: any) => {
        const layer = e.layer;
        drawnItems.addLayer(layer);

        if (layer instanceof L.Polygon) {
          if (surveyArea) {
            drawnItems.removeLayer(surveyArea);
          }
          setSurveyArea(layer);
          const latLngs = layer.getLatLngs()[0] as { lat: number; lng: number }[];
          const coordinates = latLngs.map((latlng) => ({
            lat: latlng.lat,
            lng: latlng.lng
          }));
          if (onAreaSelect) onAreaSelect(coordinates);

          // Generate grid pattern for survey
          const bounds = layer.getBounds();
          const gridSpacing = 50; // meters
          const gridLines: any[] = [];
          
          let isEvenRow = true;
          for (let lat = bounds.getSouth(); lat <= bounds.getNorth(); lat += gridSpacing / 111111) {
            const point1: LatLngTuple = [lat, isEvenRow ? bounds.getWest() : bounds.getEast()];
            const point2: LatLngTuple = [lat, isEvenRow ? bounds.getEast() : bounds.getWest()];
            gridLines.push(L.polyline([point1, point2], { color: '#16a34a', weight: 2, opacity: 0.5 }));
            isEvenRow = !isEvenRow;
          }

          if (flightPath) {
            drawnItems.removeLayer(flightPath);
          }
          const newFlightPath = L.layerGroup(gridLines);
          drawnItems.addLayer(newFlightPath);
          setFlightPath(newFlightPath);
        } else if (layer instanceof L.Marker) {
          setWaypointsState([...waypointsState, layer]);
          const position = layer.getLatLng();
          if (onWaypointAdd) onWaypointAdd({ lat: position.lat, lng: position.lng });

          // Connect waypoints with lines
          if (waypointsState.length > 0) {
            const lastWaypoint = waypointsState[waypointsState.length - 1];
            const line = L.polyline(
              [lastWaypoint.getLatLng(), layer.getLatLng()],
              { color: '#dc2626', weight: 2, dashArray: '5, 10' }
            );
            drawnItems.addLayer(line);
          }
        }
      });

      // Handle edit events
      map.on('draw:edited', (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon) {
            const latLngs = layer.getLatLngs()[0] as { lat: number; lng: number }[];
            const coordinates = latLngs.map((latlng) => ({
              lat: latlng.lat,
              lng: latlng.lng
            }));
            if (onAreaSelect) onAreaSelect(coordinates);
          }
        });
      });

      // Handle delete events
      map.on('draw:deleted', (e: any) => {
        const layers = e.layers;
        layers.eachLayer((layer: any) => {
          if (layer instanceof L.Polygon) {
            setSurveyArea(null);
            if (onAreaSelect) onAreaSelect([]);
          } else if (layer instanceof L.Marker) {
            setWaypointsState(waypointsState.filter(w => w !== layer));
          }
        });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, onAreaSelect, onWaypointAdd, waypoints, surveyArea, flightPath]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    if (flightPath) flightPath.remove();

    const L = require('leaflet');

    // Add waypoint markers and flight path
    const newMarkers = waypoints.map(waypoint => {
      const position: LatLngTuple = [waypoint.latitude, waypoint.longitude];
      return L.marker(position)
        .bindPopup(`Altitude: ${waypoint.altitude}m`)
        .addTo(mapRef.current!);
    });

    // Draw flight path
    if (waypoints.length > 1) {
      const pathCoordinates: LatLngTuple[] = waypoints.map(wp => 
        [wp.latitude, wp.longitude]
      );
      const path = L.polyline(pathCoordinates, { color: 'blue', weight: 2 });
      const newFlightPath = L.layerGroup([path]).addTo(mapRef.current);
      setFlightPath(newFlightPath);
    }

    setMarkers(newMarkers);
  }, [waypoints]);

  return (
    <div id="map" className="w-full h-full rounded-lg" />
  );
}

// Export the dynamic component instead of the inner component
export default function DroneMap(props: DroneMapProps) {
  return <DroneMapComponent {...props} />;
}
