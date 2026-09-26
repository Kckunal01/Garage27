import Link from 'next/link'

export function LostInGarage() {
  return (
    <div className="wrap section lost">
      <p className="lost__code" aria-hidden="true">
        404
      </p>
      <p className="label label--amber">WRONG BAY</p>
      <h1 className="headline">This bay is empty.</h1>
      <p className="lede">Whatever you were looking for got wheeled out. Try one of these instead.</p>
      <div className="confirm__ctas">
        <Link className="btn btn--ignite" href="/build">
          BUILD YOUR BIKE
        </Link>
        <Link className="btn" href="/garage">
          THE GARAGE
        </Link>
      </div>
    </div>
  )
}
