// src/components/Dashboard/Maps.tsx
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

declare global {
  interface Window { google: any }
}

interface Crop {
  id:        string;
  crop_type: string;
  latitude:  number;
  longitude: number;
}

export default function Maps() {
  const mapRef         = useRef<HTMLDivElement>(null);
  const infoWindow     = useRef<any>(null);
  const markersRef     = useRef<Map<string, any>>(new Map());

  const [map, setMap]                  = useState<any>(null);
  const [userLoc, setUserLoc]          = useState<{lat:number,lng:number}|null>(null);
  const [crops, setCrops]              = useState<Crop[]>([]);
  const [selectedId, setSelectedId]    = useState<string|null>(null);
  const [directionsService, setDS]     = useState<any>(null);
  const [directionsRenderer, setDR]    = useState<any>(null);
  const [distanceMatrix, setDM]        = useState<any>(null);

  // ─── 1) Load Google Maps & init services ──────────────────────────────
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true; script.defer = true;
    script.onload = () => {
      if (!mapRef.current) return;
      const m = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 12,
      });
      setMap(m);
      setDS(new window.google.maps.DirectionsService());
      setDR(new window.google.maps.DirectionsRenderer({ map: m }));
      setDM(new window.google.maps.DistanceMatrixService());
      infoWindow.current = new window.google.maps.InfoWindow();
    };
    document.head.appendChild(script);
  }, []);

  // ─── 2) Geolocate user separately so all browsers prompt properly ─────────
  useEffect(() => {
    if (!map) return;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(loc);
          map.setCenter(loc);
          new window.google.maps.Marker({
            position: loc,
            map,
            title: 'You are here',
          });
        },
        err => {
          console.error('Geolocation error:', err);
          // optional: show message to user
        }
      );
    } else {
      console.error('Geolocation not supported');
    }
  }, [map]);

  // ─── 3) Fetch crop plots ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get<Crop[]>('http://127.0.0.1:5000/crops', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then(r => setCrops(r.data))
    .catch(console.error);
  }, []);

  // ─── 4) Place markers for each crop ────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    // clear any old
    markersRef.current.forEach(mk => mk.setMap(null));
    markersRef.current.clear();

    crops.forEach(crop => {
      const mk = new window.google.maps.Marker({
        map,
        position: { lat: crop.latitude, lng: crop.longitude },
        title: crop.crop_type,
      });
      mk.addListener('click', () => {
        setSelectedId(crop.id);
        drawRoute(crop, mk);
      });
      markersRef.current.set(crop.id, mk);
    });
  }, [map, crops]);

  // ─── 5) Fit map to show you + all plots once both exist ───────────────
  useEffect(() => {
    if (!map || !userLoc || crops.length === 0) return;
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(userLoc);
    crops.forEach(c => bounds.extend({ lat: c.latitude, lng: c.longitude }));
    map.fitBounds(bounds, { top: 50, bottom: 150, left: 50, right: 50 });
  }, [map, userLoc, crops]);

  // ─── 6) Handle bottom‐list clicks ─────────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    const crop = crops.find(c => c.id === selectedId);
    const mk   = markersRef.current.get(selectedId);
    if (crop && mk) drawRoute(crop, mk);
  }, [selectedId]);

  // ─── Route + styled InfoWindow with 🚗 + 🚶 metrics ───────────────────
  const drawRoute = (crop: Crop, mk: any) => {
    if (!map || !userLoc || !directionsService || !directionsRenderer || !distanceMatrix) return;

    // clear existing
    directionsRenderer.set('directions', null);
    infoWindow.current.close();

    // driving
    directionsService.route({
      origin: userLoc,
      destination: { lat: crop.latitude, lng: crop.longitude },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (drRes: any, drStatus: string) => {
      if (drStatus !== 'OK') {
        console.error('Driving route failed:', drStatus);
        return;
      }
      directionsRenderer.setDirections(drRes);
      const leg = drRes.routes[0].legs[0];

      // walking metrics
      distanceMatrix.getDistanceMatrix({
        origins: [userLoc],
        destinations: [{ lat: crop.latitude, lng: crop.longitude }],
        travelMode: window.google.maps.TravelMode.WALKING,
      }, (wm: any) => {
        const walk = wm.rows[0].elements[0];

        const html = `
          <div style="
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.15);
            padding: 12px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
            min-width: 200px;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            ">
              <strong>📍 ${crop.crop_type}</strong>
              <span id="popup-close" style="cursor:pointer;">×</span>
            </div>
            <div style="margin-bottom:4px;">
              🚗 ${leg.distance.text} (${leg.duration.text})
            </div>
            <div>
              🚶 ${walk.distance.text} (${walk.duration.text})
            </div>
          </div>
        `;
        infoWindow.current.setContent(html);
        infoWindow.current.open(map, mk);

        setTimeout(() => {
          document.getElementById('popup-close')?.addEventListener('click', () => {
            infoWindow.current.close();
          });
        }, 0);
      });
    });
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top half: Map */}
      <div ref={mapRef} className="h-1/2 w-full" />

      {/* Bottom half: Plot list */}
      <div className="h-1/2 overflow-auto bg-white p-4">
        <h2 className="text-xl font-semibold mb-2">Find your way to your plots</h2>
        <ul className="divide-y divide-gray-200">
          {crops.length === 0
            ? <li className="py-2 text-gray-500">No plots found.</li>
            : crops.map(crop => (
                <li
                  key={crop.id}
                  onClick={() => setSelectedId(crop.id)}
                  className={`
                    flex justify-between items-center py-2 px-2 cursor-pointer
                    ${selectedId === crop.id ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <span>📍 {crop.crop_type}</span>
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5l7 7-7 7" />
                  </svg>
                </li>
              ))
          }
        </ul>
      </div>
    </div>
  );
}
