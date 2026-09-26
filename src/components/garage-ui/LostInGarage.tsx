import Image from 'next/image'
import Link from 'next/link'
import { ENVIRONMENTS } from '@/lib/environments'

/**
 * 404 — "wrong bay". The same garage as Home, out of focus with the lights
 * down. Two compositions (see .lost in environment.css):
 *   mobile  — portrait crop, numeral over a bottom-anchored copy stack
 *   desktop — wide crop, numeral owns the left zone, copy the right zone
 */
export function LostInGarage() {
  return (
    <section className="lost" aria-labelledby="lost-title">
      <div className="lost__env" aria-hidden="true">
        <Image className="lost__img" src={ENVIRONMENTS.garageNight} alt="" fill sizes="50vw" quality={75} />
        <div className="lost__shade" />
      </div>
      <div className="lost__stage">
        <p className="lost__code" aria-hidden="true">
          404
        </p>
        <div className="lost__copy">
          <p className="lost__kicker">WRONG BAY</p>
          <h1 id="lost-title" className="lost__title">
            This bay is empty.
          </h1>
          <p className="lost__lede">Whatever you were looking for got wheeled out. Try one of these instead.</p>
          <div className="lost__ctas">
            <Link className="btn btn--ignite" href="/build">
              BUILD YOUR BIKE
            </Link>
            <Link className="btn" href="/garage">
              THE GARAGE
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
