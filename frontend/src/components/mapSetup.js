import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export const DEFAULT_CENTER = [24.8607, 67.0011]

export function createLabeledIcon(label, color = '#0d6e4f') {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:600;box-shadow:0 1px 4px rgba(0,0,0,.35);white-space:nowrap;">${label}</div>`,
    iconSize: [48, 24],
    iconAnchor: [24, 12],
  })
}
