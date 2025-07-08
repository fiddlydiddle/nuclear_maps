import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { nuclearDetonation } from './dataModels/nuclearDetonation';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function App() {
  const [detonationData, setDetonationData] = useState<nuclearDetonation[]>([]);

  // Table paging
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const selectedDetonations = useMemo(() =>
    detonationData.slice(pageNumber * pageSize, (pageNumber * pageSize) + pageSize)
    , [detonationData, pageNumber, pageSize]);

  // Component initialization
  useEffect(() => {
    fetch('/detonation-data.json')
      .then(async (response) => {
        const jsonData = await response.json();
        setDetonationData(jsonData);
      })
      .catch((err) => {
        alert(err);
      });
  }, []);

  return (
    <>
      <h3>Nuclear Detonations</h3>
      <div className='map-wrapper'>
        <MapContainer
          className='map-container'
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={false}
        >
          <TileLayer
            className='tile-layer'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selectedDetonations && selectedDetonations.map(detonation =>
            <Marker position={[detonation.latitude, detonation.longitude]}>
              <Popup>
                {detonation.detonationYear} - {detonation.detonatedBy} - {detonation.upperYield} kilotons - {detonation.depth} depth
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
      <div className='table-container'>
        <div className='paging-container'>
          <button
            className='paging-button'
            onClick={() => setPageNumber(Math.max(0, pageNumber - 1))}
          >
            Previous
          </button>
          Page {pageNumber + 1} of {Math.ceil(detonationData.length / pageSize)}
          <button
            className='paging-button'
            onClick={() => setPageNumber(Math.min(Math.ceil(detonationData.length / pageSize), pageNumber + 1))}
          >
            Next
          </button>
        </div>
        <table>
          <thead>
            <th>Country</th>
            <th>Year</th>
            <th>Coordinates</th>
            <th>Yield</th>
          </thead>
          <tbody>
            {selectedDetonations && selectedDetonations.map(detonation =>
              <tr>
                <td>{detonation.detonatedBy}</td>
                <td>{detonation.detonationYear}</td>
                <td>({detonation.latitude}, {detonation.longitude})</td>
                <td>{detonation.upperYield}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default App
