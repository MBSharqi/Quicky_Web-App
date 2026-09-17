import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { DEFAULT_CENTER, createLabeledIcon } from './mapSetup'

function FitBounds({ points }) {
  const map = useMap()

  useEffect(() => {
    const valid = points.filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]))
    if (valid.length === 0) {
      map.setView(DEFAULT_CENTER, 12)
      return
    }
    if (valid.length === 1) {
      map.setView(valid[0], 14)
      return
    }
    map.fitBounds(valid, { padding: [40, 40] })
  }, [map, points])

  return null
}

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect?.([event.latlng.lat, event.latlng.lng])
    },
  })

  return null
}

export default function OrderMap({
  pickup,
  dropoff,
  rider,
  selectable = null,
  onMapClick,
  height = 320,
}) {
  const points = useMemo(
    () => [pickup, dropoff, rider].filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1])),
    [pickup, dropoff, rider],
  )

  const route = useMemo(
    () => [pickup, dropoff].filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1])),
    [pickup, dropoff],
  )

  return (
    <div style={{ height }}>
      <MapContainer center={DEFAULT_CENTER} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {onMapClick && <ClickHandler onSelect={onMapClick} />}
        {Number.isFinite(pickup?.[0]) && Number.isFinite(pickup?.[1]) && (
          <Marker position={pickup} icon={createLabeledIcon('Pickup', '#0d6e4f')} />
        )}
        {Number.isFinite(dropoff?.[0]) && Number.isFinite(dropoff?.[1]) && (
          <Marker position={dropoff} icon={createLabeledIcon('Dropoff', '#1d4ed8')} />
        )}
        {Number.isFinite(rider?.[0]) && Number.isFinite(rider?.[1]) && (
          <Marker position={rider} icon={createLabeledIcon('Rider', '#b45309')} />
        )}
        {selectable && Number.isFinite(selectable?.[0]) && Number.isFinite(selectable?.[1]) && (
          <Marker position={selectable} icon={createLabeledIcon('Pin', '#334155')} />
        )}
        {route.length === 2 && <Polyline positions={route} pathOptions={{ color: '#0d6e4f', weight: 3 }} />}
      </MapContainer>
    </div>
  )
}
