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
      width: 464,
      height: 265,
      alt: 'The Road Nomad: a black chopper with a red flame-painted tank, tan diamond-stitched solo seat, chrome spoked wheels and black exhaust',
      paintedBackdrop: true,
      contact: { rear: [0.155, 0.864], front: [0.802, 0.996] },
    },
  },
]
