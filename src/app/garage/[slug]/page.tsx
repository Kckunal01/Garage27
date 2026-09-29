import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CONTACT } from '@/components/navigation/nav-config'
import { GarageScene } from '@/features/garage/showcase/GarageScene'
import { getGarageMachine, getGarageMachines, machineHref, machineNumber } from '@/lib/catalogue/garage'
import { pageMetadata } from '@/lib/seo/metadata'

export const dynamicParams = false

export function generateStaticParams() {
  return getGarageMachines().map((m) => ({ slug: m.slug }))
}

export async function generateMetadata({ params }: PageProps<'/garage/[slug]'>): Promise<Metadata> {
  const machine = getGarageMachine((await params).slug)
  if (!machine) return {}
  return pageMetadata({
    title: `${machineNumber(machine)} ${machine.name} — ${machine.kind}`,
    description: `${machineNumber(machine)} ${machine.name}: a finished ${machine.kind.toLowerCase()}, custom built by Garage 27. Customise without compromising.`,
    path: machineHref(machine),
  })
}

export default async function GarageMachinePage({ params }: PageProps<'/garage/[slug]'>) {
  const machine = getGarageMachine((await params).slug)
  if (!machine) notFound()
  const number = machineNumber(machine)
  const ask = `Hi Garage 27, I'd like to know more about ${number} ${machine.name}.`
  return (
    <GarageScene machine={machine} detail>
      <div className="gsheet">
        <p className="gsheet__by">CUSTOM BUILT · GARAGE 27</p>
        <p className="gsheet__ask">
          <a className="gsheet__link" href={`${CONTACT.whatsapp}?text=${encodeURIComponent(ask)}`} target="_blank" rel="noopener noreferrer">
            ASK ABOUT {number}
          </a>
          <span className="gsheet__or">
            or write to <a href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`${number} ${machine.name}`)}`}>{CONTACT.email}</a>
          </span>
        </p>
        <Link href="/garage" className="gsheet__back">
          THE GARAGE
        </Link>
      </div>
    </GarageScene>
  )
}
