import type { GarageMachine } from '@/types/catalogue'

/**
 * The Garage — finished Garage 27 machines, one catalogue number each.
 * Only what is known about a machine goes here: no invented specifications.
 */
export const garageMachines: GarageMachine[] = [
  {
    slug: '01',
    number: 1,
    name: 'THE ROAD NOMAD',
    kind: 'LONG RIDE CHOPPER',
    image: {
      src: '/assets/garage/%2301.png',
      width: 1660,
      height: 948,
      alt: 'The Road Nomad: a black chopper with a red flame-painted tank, tan diamond-stitched solo seat, chrome spoked wheels and black exhaust, on the wet floor of the Garage 27 workshop',
      frame: { x: 0.138, y: 0.214, w: 0.66, h: 0.751 },
    },
  },
]
