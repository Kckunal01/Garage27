'use client'

import type { Bike, BuildConfiguration, ComponentOption, MaterialConfig } from '@/types/catalogue'
import { ProceduralBike } from '../viewport/ProceduralBike'
import { GlbVehicle } from './GlbVehicle'

/**
 * Picks the model adapter from catalogue data. The build bay never knows
 * which vehicle it is showing — only `bike.model3d.kind`.
 *   procedural → in-house TEST rig (until production models are supplied)
 *   glb        → production GLB with stable node names
 */
export function VehicleModel(props: { bike: Bike; config: BuildConfiguration; options: ComponentOption[]; paint: MaterialConfig; segments: number }) {
  if (props.bike.model3d?.kind === 'glb') return <GlbVehicle bike={props.bike} config={props.config} options={props.options} paint={props.paint} />
  return <ProceduralBike model={props.bike.model3d} config={props.config} options={props.options} paint={props.paint} segments={props.segments} />
}
