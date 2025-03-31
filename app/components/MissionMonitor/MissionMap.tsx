"use client";

import { useEffect, useRef } from 'react';
import { Coordinate } from '../../types/mission';
import 'leaflet/dist/leaflet.css';
import styles from './MissionMonitor.module.css';

interface MissionMapProps {
  surveyArea: Coordinate[];
  waypoints: Coordinate[];
  currentPosition?: Coordinate;
  completedWaypoints: number;
}

export default function MissionMap({
  surveyArea,
  waypoints,
  currentPosition,
  completedWaypoints
}: MissionMapProps) {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const droneMarkerRef = useRef<any>(null);
  const waypointLayersRef = useRef<any[]>([]);
  const pathLayerRef = useRef<any>(null);
  const areaLayerRef = useRef<any>(null);

  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined' && !mapInstanceRef.current) {
        const L = (await import('leaflet')).default;

        // Calculate center of survey area
        const center = surveyArea.reduce(
          (acc, coord) => ({
            lat: acc.lat + coord.lat / surveyArea.length,
            lng: acc.lng + coord.lng / surveyArea.length
          }),
          { lat: 0, lng: 0 }
        );

        // Initialize map
        const map = L.map(mapRef.current).setView([center.lat, center.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Create custom drone icon
        const droneIcon = L.divIcon({
          className: styles.droneIcon,
          html: '<div class="drone-icon"></div>',
          iconSize: [24, 24]
        });

        // Add survey area polygon
        const areaLayer = L.polygon(surveyArea, {
          color: '#2563eb',
          fillColor: '#3b82f6',
          fillOpacity: 0.2,
          weight: 2
        }).addTo(map);
        areaLayerRef.current = areaLayer;

        // Add waypoint markers and connect them with lines
        const waypointLayers = waypoints.map((waypoint, index) => {
          const marker = L.marker([waypoint.lat, waypoint.lng], {
            icon: L.divIcon({
              className: `${styles.waypointMarker} ${
                index < completedWaypoints ? styles.completed : ''
              }`,
              html: `<div class="waypoint-marker">${index + 1}</div>`,
              iconSize: [24, 24]
            })
          }).addTo(map);
          return marker;
        });
        waypointLayersRef.current = waypointLayers;

        // Create path between waypoints
        const pathLayer = L.polyline(waypoints, {
          color: '#16a34a',
          weight: 2,
          dashArray: '5, 10'
        }).addTo(map);
        pathLayerRef.current = pathLayer;

        // Add drone marker if current position exists
        if (currentPosition) {
          const droneMarker = L.marker([currentPosition.lat, currentPosition.lng], {
            icon: droneIcon
          }).addTo(map);
          droneMarkerRef.current = droneMarker;
        }

        mapInstanceRef.current = map;
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [surveyArea, waypoints]);

  // Update drone position and completed waypoints
  useEffect(() => {
    if (mapInstanceRef.current && currentPosition) {
      if (droneMarkerRef.current) {
        droneMarkerRef.current.setLatLng([currentPosition.lat, currentPosition.lng]);
      } else {
        const L = require('leaflet');
        const droneIcon = L.divIcon({
          className: styles.droneIcon,
          html: '<div class="drone-icon"></div>',
          iconSize: [24, 24]
        });
        droneMarkerRef.current = L.marker([currentPosition.lat, currentPosition.lng], {
          icon: droneIcon
        }).addTo(mapInstanceRef.current);
      }

      // Update waypoint styles based on completion
      waypointLayersRef.current.forEach((marker, index) => {
        const element = marker.getElement();
        if (element) {
          if (index < completedWaypoints) {
            element.classList.add(styles.completed);
          } else {
            element.classList.remove(styles.completed);
          }
        }
      });
    }
  }, [currentPosition, completedWaypoints]);

  return <div ref={mapRef} className={styles.map} />;
}
