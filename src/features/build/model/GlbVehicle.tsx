'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import { createPortal } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import type { Material, Mesh, MeshPhysicalMaterial, Object3D } from 'three'
import type { Bike, BuildConfiguration, ComponentOption, MaterialConfig } from '@/types/catalogue'

/**
 * GLB MODEL ADAPTER — production vehicles.
 *
 * Contract for a vehicle GLB (Draco/Meshopt-compressed, lazy-loaded when the
 * vehicle is selected — never preloaded for the whole catalogue):
 *  - Stable node names: `bike.frame`, `bike.tank`, `bike.seat`, `bike.headlight`,
 *    `bike.handlebar`, `bike.exhaust`, `bike.rearFender`, `bike.luggage`, …
 *  - Option variants that ship inside the vehicle file are child nodes named
 *    by the option (`modelAsset: { kind: 'glb', url: <vehicle ref>, node }`);
 *    the selected one is shown, the slot's other variants hidden.
 *  - Options shipped as their own GLB (`url` ≠ vehicle ref) are attached at
 *    the option's first `affectedNodes` anchor.
 *  - `model3d.paintNodes` lists the nodes whose meshes take the colour.
 */
export function GlbVehicle({ bike, config, options, paint }: { bike: Bike; config: BuildConfiguration; options: ComponentOption[]; paint: MaterialConfig }) {
  const src = bike.model3d!.ref
  const gltf = useGLTF(src, '/draco/', true)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  // Variant visibility: one selected option per slot is visible.
  useLayoutEffect(() => {
    const selected = new Set(Object.values(config.components).filter(Boolean))
    for (const o of options) {
      if (o.modelAsset.kind !== 'glb' || o.modelAsset.url !== src || !o.modelAsset.node) continue
      const node = scene.getObjectByName(o.modelAsset.node)
      if (node) node.visible = selected.has(o.id)
    }
  }, [scene, config.components, options, src])

  // Paint: clone the paint materials once per model, then update them in place per colour.
  const paintNodes = bike.model3d?.paintNodes
  const paintMaterials = useRef<MeshPhysicalMaterial[]>([])
  useLayoutEffect(() => {
    const mats: MeshPhysicalMaterial[] = []
    for (const name of paintNodes ?? []) {
      scene.getObjectByName(name)?.traverse((obj) => {
        const mesh = obj as Mesh
        if (!mesh.isMesh) return
        const cloned = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((m: Material) => m.clone() as MeshPhysicalMaterial)
        mesh.material = Array.isArray(mesh.material) ? cloned : cloned[0]!
        mats.push(...cloned)
      })
    }
    paintMaterials.current = mats
    return () => mats.forEach((m) => m.dispose())
  }, [scene, paintNodes])

  useLayoutEffect(() => applyPaint(paintMaterials.current, paint), [scene, paintNodes, paint])

  // Options delivered as their own GLB, attached at their anchor node.
  const attached = Object.values(config.components)
    .map((id) => options.find((o) => o.id === id))
    .filter((o): o is ComponentOption => !!o && o.modelAsset.kind === 'glb' && o.modelAsset.url !== src)

  return (
    <>
      <primitive object={scene} />
      {attached.map((o) => {
        const anchor = scene.getObjectByName(o.affectedNodes[0] ?? '')
        return anchor ? <AttachedPart key={o.id} option={o} anchor={anchor} /> : null
      })}
    </>
  )
}

/** In-place material update (three.js objects are imperative — no scene rebuild). */
function applyPaint(mats: MeshPhysicalMaterial[], paint: MaterialConfig) {
  for (const m of mats) {
    m.color?.set(paint.color)
    if ('metalness' in m) m.metalness = paint.metalness
    if ('roughness' in m) m.roughness = paint.roughness
    if ('clearcoat' in m && paint.clearcoat !== undefined) m.clearcoat = paint.clearcoat
    m.needsUpdate = true
  }
}

function AttachedPart({ option, anchor }: { option: ComponentOption; anchor: Object3D }) {
  const asset = option.modelAsset as { kind: 'glb'; url: string; node?: string }
  const gltf = useGLTF(asset.url, '/draco/', true)
  const obj = useMemo(() => (asset.node ? gltf.scene.getObjectByName(asset.node) : gltf.scene)?.clone(true), [gltf.scene, asset.node])
  return obj ? createPortal(<primitive object={obj} />, anchor) : null
}
