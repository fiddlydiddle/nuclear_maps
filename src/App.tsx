import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { NuclearDetonation } from './interfaces/NuclearDetonation';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MapMarkers from './components/MapMarkers/MapMarkers';

function App() {
  const [detonationData, setDetonationData] = useState<NuclearDetonation[]>([]);

  // Table paging
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10000);

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
        <APIProvider
          apiKey={'put-api-key-here'}
          onLoad={() => console.log('Maps API has loaded')}
        >
          <Map
            defaultZoom={2}
            defaultCenter={{ lat: 0, lng: 0 }}
            mapTypeId={'satellite'}
            mapId={'map'}
            zoomControl={true}
          >
            <MapMarkers pointsOfInterest={selectedDetonations} />
          </Map>
        </APIProvider>
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
            <tr>
              <th>Country</th>
              <th>Year</th>
              <th>Coordinates</th>
              <th>Yield</th>
            </tr>
          </thead>
          <tbody>
            {selectedDetonations && selectedDetonations.map(detonation =>
              <tr key={crypto.randomUUID()}>
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
