import { AdvancedMarker, InfoWindow, Pin, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import type { Marker, Renderer } from '@googlemaps/markerclusterer';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import type { NuclearDetonation } from "../../interfaces/NuclearDetonation";

function MapMarkers(props: { pointsOfInterest: NuclearDetonation[] }) {
  const nuclearGreenColor = '#7cfc00';
  const googleMap = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);
  const [selectedDetonation, setSelectedDetonation] = useState<NuclearDetonation | null>(null);

  // On map change, recluster markers
  useEffect(() => {
    if (!googleMap) return;
    if (!clusterer.current) {
      const renderer = {
        render: ({ count, position }: { count: number; position: google.maps.LatLng }) => {
          const cluster = new google.maps.Marker({
            position,
            label: {
              text: count.toString(),
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 'bold'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: nuclearGreenColor,
              fillOpacity: 0.8,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 20
            }
          });
          return cluster;
        }
      };

      clusterer.current = new MarkerClusterer({
        map: googleMap,
        renderer: renderer,
        algorithm: new SuperClusterAlgorithm({
          maxZoom: 15,
          radius: 60,
          minPoints: 1,
        })
      });
    }
  }, [googleMap]);

  // On marker collection change, update clusterer
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return; // Marker already exists
    if (!marker && !markers[key]) return; // Bad marker reference

    setMarkers(prev => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  const getOverviewInfo = (nuclearDetonation: NuclearDetonation) => {
    return `${nuclearDetonation.name || 'Unnamed'} - ${nuclearDetonation.detonatedBy} - ${nuclearDetonation.detonationYear}`;
  };

  return (
    <>
      {props.pointsOfInterest.map(pointOfInterest => {
        const isSelected = selectedDetonation?.id.toString() === pointOfInterest.id.toString();

        return (
          <>
            <AdvancedMarker
              key={pointOfInterest.id.toString()}
              position={{ lat: pointOfInterest.latitude, lng: pointOfInterest.longitude }}
              ref={marker => setMarkerRef(marker, pointOfInterest.id.toString())}
              title={getOverviewInfo(pointOfInterest)}
              clickable={true}
              onClick={() => setSelectedDetonation(pointOfInterest)}
            >
              <Pin
                background={nuclearGreenColor}
                glyphColor={'#000000'}
                borderColor={'#000000'}
              />
            </AdvancedMarker>
            {isSelected && (
              <InfoWindow
                position={{ lat: pointOfInterest.latitude, lng: pointOfInterest.longitude }}
                onCloseClick={() => setSelectedDetonation(null)}
              >
                <div style={{color: 'black'}}>
                  <h4 style={{ margin: '0 0 0 0', fontSize: '16px', fontWeight: 'bold' }}>
                    {pointOfInterest.name || 'Unnamed Detonation'}
                  </h4>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Country:</strong> {pointOfInterest.detonatedBy}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Year:</strong> {pointOfInterest.detonationYear}
                  </p>
                  <p style={{ margin: '4px 0' }}>
                    <strong>Coordinates:</strong> {pointOfInterest.latitude.toFixed(0)}, {pointOfInterest.longitude.toFixed(0)}
                  </p>
                  {pointOfInterest.upperYield && (
                    <p style={{ margin: '4px 0' }}>
                      <strong>Yield:</strong> {pointOfInterest.upperYield}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </>
        )
      })}
    </>
  )
}

export default MapMarkers;