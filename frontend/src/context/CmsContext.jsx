import { createContext, useContext, useEffect, useState } from 'react'
import { getPublicCms } from '../api/cms'

const CmsContext = createContext(null)

const fallbackSettings = {
  brand_name: 'Quicky',
  logo_url: null,
  hero_kicker: 'Quicky',
  hero_title: 'Local food & shops, delivered fast',
  hero_subtitle: 'Search restaurants, hotels, and shops near you. Add items to your cart and order with cash on delivery.',
  search_placeholder: 'Search shops, food, or city...',
  search_button_label: 'Search',
  browse_title: 'Open now',
  browse_subtitle: 'Browse available restaurants and shops',
  empty_shops_title: 'No shops found',
  empty_shops_subtitle: 'Try another search or check back soon.',
  footer_text: 'Quicky — local delivery marketplace',
}

export function CmsProvider({ children }) {
  const [settings, setSettings] = useState(fallbackSettings)
  const [banners, setBanners] = useState([])
  const [pages, setPages] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (settings.brand_name) {
      document.title = settings.brand_name
    }
  }, [settings.brand_name])

  async function refresh() {
    const data = await getPublicCms()
    setSettings({ ...fallbackSettings, ...(data.settings || {}) })
    setBanners(data.banners || [])
    setPages(data.pages || [])
  }

  useEffect(() => {
    let active = true

    getPublicCms()
      .then((data) => {
        if (!active) {
          return
        }
        const nextSettings = { ...fallbackSettings, ...(data.settings || {}) }
        setSettings(nextSettings)
        setBanners(data.banners || [])
        setPages(data.pages || [])
        if (nextSettings.brand_name) {
          document.title = nextSettings.brand_name
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) {
          setReady(true)
        }
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <CmsContext.Provider value={{ settings, banners, pages, ready, refresh }}>
      {children}
    </CmsContext.Provider>
  )
}

export function useCms() {
  const context = useContext(CmsContext)
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider')
  }
  return context
}
