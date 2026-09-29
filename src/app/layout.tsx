import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource/bodoni-moda/400.css'
import '@fontsource/bodoni-moda/400-italic.css'
import '@fontsource/bodoni-moda/700.css'
import '@fontsource/oswald/400.css'
import '@fontsource/oswald/500.css'
import '@fontsource/oswald/600.css'
import '@fontsource/barlow/400.css'
import '@fontsource/barlow/500.css'
import '@fontsource/mr-dafoe/400.css'
import '@fontsource/instrument-serif/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/chrome.css'
import '@/styles/environment.css'
import '@/styles/ui.css'
import '@/styles/pages.css'
import '@/styles/garage.css'
import '@/styles/home.css'
import '@/styles/build.css'
import { Providers } from './providers'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { GarageFooter } from '@/components/navigation/GarageFooter'
import { GarageNav } from '@/components/navigation/GarageNav'
import { publicEnv } from '@/lib/env'

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: 'Garage 27 — Custom Motorcycles, Built Different', template: '%s · Garage 27' },
  description: 'Garage 27 is a custom motorcycle workshop. Build your bike in our 3D build bay, shop custom parts, or book customisation and restoration services.',
  applicationName: 'Garage 27',
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#0a0908',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Providers>
          <SiteHeader />
          <main id="main">{children}</main>
          <GarageFooter />
          <GarageNav />
        </Providers>
      </body>
    </html>
  )
}
