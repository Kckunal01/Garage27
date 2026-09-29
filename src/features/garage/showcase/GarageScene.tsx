import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { machineHref, machineNumber } from '@/lib/catalogue/garage'
import type { GarageMachine } from '@/types/catalogue'
import { GarageBike } from './GarageBike'

export const GARAGE_ENVIRONMENT = '/assets/garage/garage-base.png'

const LEGAL = ['NO LEGAL ISSUES.', 'NO INSURANCE ISSUES.', 'NO RESALE ISSUES.']

/** The catalogue plate that belongs to the machine: number, name, kind. */
function MachinePlate({ machine, as: Name = 'p' }: { machine: GarageMachine; as?: 'p' | 'h1' }) {
  return (
    <div className="gshow__plate">
      <span className="gshow__num">{machineNumber(machine)}</span>
      <Name className="gshow__name">{machine.name}</Name>
      <span className="gshow__kind">{machine.kind}</span>
    </div>
  )
}

/**
 * The Garage: one finished machine standing inside Garage 27. The workshop
 * photograph is the room; the machine stands on its floor. Above it, the
 * house line and the three statements; beside it, its catalogue plate.
 * In the showcase the machine is the way in to its catalogue page.
 */
export function GarageScene({ machine, detail, children }: { machine: GarageMachine; detail?: boolean; children?: ReactNode }) {
  return (
    <section className={`gshow${detail ? ' gshow--detail' : ''}`} aria-label={`${machineNumber(machine)} ${machine.name}`}>
      <div className="gshow__env" aria-hidden="true">
        <Image className="gshow__envimg" src={GARAGE_ENVIRONMENT} alt="" fill sizes="100vw" quality={90} preload />
        <div className="gshow__grade" />
      </div>

      <div className="gshow__intro">
        {detail ? (
          <p className="gshow__script" aria-hidden="true">
            <span>Built different.</span>
            <span className="gshow__script-red">Always.</span>
          </p>
        ) : (
          <h1 className="gshow__script">
            <span className="sr-only">The Garage: </span>
            <span>Built different.</span>
            <span className="gshow__script-red">Always.</span>
          </h1>
        )}
        <p className="gshow__line">CUSTOMISE WITHOUT COMPROMISING.</p>
        <ul className="gshow__legal" aria-label="Every Garage 27 machine">
          {LEGAL.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </div>

      {detail ? (
        <div className="gshow__stage">
          <GarageBike image={machine.image} />
          <MachinePlate machine={machine} as="h1" />
          {children}
        </div>
      ) : (
        <Link href={machineHref(machine)} className="gshow__stage gshow__stage--link" aria-label={`${machineNumber(machine)} ${machine.name}, ${machine.kind.toLowerCase()}. See this machine.`}>
          <GarageBike image={machine.image} />
          <MachinePlate machine={machine} />
          <svg className="gshow__chev" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </section>
  )
}
