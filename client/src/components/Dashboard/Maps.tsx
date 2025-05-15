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
  const [geoError, setGeoError]        = useState<string|null>(null);
  const [manualLocation, setManualLocation] = useState<boolean>(false);

  // ─── 1) Load Google Maps & init services ──────────────────────────────
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true; script.defer = true;
    script.onload = () => {
      if (!mapRef.current) return;
      const m = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to New York if no location
        zoom: 12,
      });
      setMap(m);
      setDS(new window.google.maps.DirectionsService());
      setDR(new window.google.maps.DirectionsRenderer({ 
        map: m,
        suppressMarkers: true // Don't show default A/B markers
      }));
      setDM(new window.google.maps.DistanceMatrixService());
      
      // Create infoWindow with custom styles
      infoWindow.current = new window.google.maps.InfoWindow({
        disableAutoPan: false,
        pixelOffset: new window.google.maps.Size(0, -35)
      });
      
      // Apply custom styles to remove default InfoWindow border and shadow
      window.google.maps.event.addListener(infoWindow.current, 'domready', () => {
        try {
          // Remove the default InfoWindow border
          const iwOuter = document.querySelector('.gm-style-iw');
          if (!iwOuter) return;
          
          const iwBackground = iwOuter.previousElementSibling;
          
          // Remove the white background and shadow
          if (iwBackground && iwBackground.children) {
            // Convert to array and handle each child
            Array.from(iwBackground.children).forEach(child => {
              if (child instanceof HTMLElement) {
                child.style.display = 'none';
              }
            });
          }
          
          // Remove the white container that holds the arrow
          const iwCloseBtn = iwOuter.nextElementSibling;
          if (iwCloseBtn instanceof HTMLElement) {
            iwCloseBtn.style.display = 'none';
          }
          
          // Remove the default close button
          const closeButtons = document.querySelectorAll('.gm-ui-hover-effect');
          closeButtons.forEach(btn => {
            if (btn instanceof HTMLElement) btn.style.display = 'none';
          });
        } catch (err) {
          console.error('Error styling InfoWindow:', err);
        }
      });
    };
    document.head.appendChild(script);
  }, []);

  // ─── 2) Improved geolocation with better error handling and fallbacks ─────
  useEffect(() => {
    if (!map) return;
    
    // Only try to get location if not already manually set
    if (!manualLocation) {
      if ('geolocation' in navigator) {
        const geoOptions = {
          enableHighAccuracy: true,
          timeout: 10000,        // 10 seconds
          maximumAge: 300000     // 5 minutes
        };
        
        navigator.geolocation.getCurrentPosition(
          pos => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLoc(loc);
            map.setCenter(loc);
            new window.google.maps.Marker({
              position: loc,
              map,
              title: 'You are here',
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }
            });
            setGeoError(null);
          },
          err => {
            console.error('Geolocation error:', err);
            let errorMsg;
            switch(err.code) {
              case 1:
                errorMsg = 'Location access denied. Please enable location permissions in your browser.';
                break;
              case 2:
                errorMsg = 'Location unavailable. Try again or set location manually.';
                break;
              case 3:
                errorMsg = 'Location request timed out. Try again or set location manually.';
                break;
              default:
                errorMsg = 'Location error. Try again or set location manually.';
            }
            setGeoError(errorMsg);
          },
          geoOptions
        );
      } else {
        setGeoError('Geolocation not supported in your browser. Please set location manually.');
      }
    }
  }, [map, manualLocation]);

  // ─── Manual location selection via map click ────────────────────────────
  useEffect(() => {
    if (!map) return;
    
    // Add click listener for manual location setting
    const clickListener = map.addListener('click', (e: any) => {
      if (manualLocation) {
        // Close any existing infoWindow first
        if (infoWindow.current) {
          infoWindow.current.close();
        }
        
        const newLoc = { lat: e.latLng.lat(), lng: e.latLng.lng() };
        setUserLoc(newLoc);
        
        // Remove any existing user markers
        markersRef.current.forEach((marker, id) => {
          if (id === 'user-location') marker.setMap(null);
        });
        
        // Add new user marker
        const marker = new window.google.maps.Marker({
          position: newLoc,
          map,
          title: 'Your selected location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }
        });
        markersRef.current.set('user-location', marker);
      }
    });
    
    return () => {
      window.google?.maps.event.removeListener(clickListener);
    };
  }, [map, manualLocation]);

  // ─── 3) Fetch crop plots ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get<Crop[]>('http://127.0.0.1:5000/crops', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .then(r => setCrops(r.data))
    .catch(err => {
      console.error('Error fetching crops:', err);
      // Optional: set an error state here to show to user
    });
  }, []);

  // ─── 4) Place markers for each crop ────────────────────────────────────
  useEffect(() => {
    if (!map) return;
    // clear any old crop markers (but keep user marker if exists)
    markersRef.current.forEach((mk, id) => {
      if (id !== 'user-location') mk.setMap(null);
    });
    
    // Create new crop markers
    crops.forEach(crop => {
      const mk = new window.google.maps.Marker({
        map,
        position: { lat: crop.latitude, lng: crop.longitude },
        title: crop.crop_type,
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
        }
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
    if (!map || crops.length === 0) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    
    // If we have user location, include it
    if (userLoc) {
      bounds.extend(userLoc);
    }
    
    // Add all crop locations
    crops.forEach(c => bounds.extend({ lat: c.latitude, lng: c.longitude }));
    
    // Only fit bounds if we have something to fit
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 50, bottom: 150, left: 50, right: 50 });
    }
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
      
      // Set driving directions, but suppress default markers
      directionsRenderer.setOptions({
        suppressMarkers: true,
        preserveViewport: true
      });
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
            box-shadow: none;
            font-family: 'Roboto', Arial, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            padding: 0;
            max-width: 250px;
          ">
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 16px 8px;
            ">
              <div style="font-weight: 500;">📍 ${crop.crop_type}</div>
              <div id="popup-close" style="
                cursor: pointer;
                font-size: 20px;
                color: #5f6368;
                margin: -6px -8px 0 0;
                width: 26px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
              ">×</div>
            </div>
            <div style="padding: 0 16px 12px;">
              <div style="margin-bottom:6px; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🚗</span> 
                <span>${leg.distance.text} (${leg.duration.text})</span>
              </div>
              <div style="display: flex; align-items: center;">
                <span style="margin-right: 8px;">🚶</span>
                <span>${walk.distance.text} (${walk.duration.text})</span>
              </div>
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

  // Toggle manual location mode
  const toggleManualLocation = () => {
    setManualLocation(prev => !prev);
    if (!manualLocation) {
      // Show a simple instruction without alert()
      if (infoWindow.current) {
        infoWindow.current.setContent(`
          <div style="padding: 8px; text-align: center;">
            Click anywhere on the map to set your location
          </div>
        `);
        infoWindow.current.setPosition(map.getCenter());
        infoWindow.current.open(map);
      }
    } else {
      // Close the info window when canceling manual mode
      if (infoWindow.current) {
        infoWindow.current.close();
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top half: Map */}
      <div className="relative h-1/2 w-full">
        <div ref={mapRef} className="h-full w-full" />
        
        {/* Location error message */}
        {geoError && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md text-sm text-red-600 max-w-xs text-center">
            {geoError}
          </div>
        )}
        
        {/* Manual location button */}
        <button 
          onClick={toggleManualLocation}
          className="absolute bottom-4 right-4 bg-white px-3 py-2 rounded-full shadow-md text-sm"
        >
          {manualLocation ? "Cancel" : "Set Location Manually"}
        </button>
      </div>

      {/* Bottom half: Plot list */}
      <div className="h-1/2 overflow-auto bg-white p-4">
        <h2 className="text-xl font-semibold mb-2">Find your way to your plots</h2>
        {!userLoc && !geoError && (
          <p className="text-sm text-gray-500 mb-2">Getting your location...</p>
        )}
        {userLoc && (
          <p className="text-sm text-gray-600 mb-2">
            Your location: {userLoc.lat.toFixed(5)}, {userLoc.lng.toFixed(5)}
            {manualLocation && " (manually set)"}
          </p>
        )}
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