import { getCatalogue } from '@/lib/catalogue/repository'
import { serviceRequestSchema } from '@/lib/validation/schemas'
import { clientIp, invalid, isSameOrigin, json, misfire, rateLimited, readImageFiles } from '@/lib/server/http'
import { getStore, makeReference } from '@/lib/server/store'
import { storeReferenceImages } from '@/lib/storage/references'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  if (rateLimited(`service:${clientIp(req)}`, 5)) return json({ error: 'Easy on the throttle — try again in a minute.' }, 429)

  let form: FormData
  let payload: unknown
  try {
    form = await req.formData()
    payload = JSON.parse(String(form.get('payload') ?? ''))
  } catch {
    return json({ error: 'Bad request' }, 400)
  }
  const parsed = serviceRequestSchema.safeParse(payload)
  if (!parsed.success) return invalid(parsed.error)

  const files = await readImageFiles(form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0))
  if (!files.ok) return json({ error: files.error, fields: { files: files.error } }, 422)

  try {
    const { services } = await getCatalogue()
    if (!services.some((s) => s.id === parsed.data.serviceId)) {
      return json({ error: 'Pick a service.', fields: { serviceId: 'Pick a service.' } }, 422)
    }
    const reference = makeReference('S')
    const attachments = await storeReferenceImages('services', reference, files.files)
    await getStore().insertServiceRequest({
      reference,
      serviceId: parsed.data.serviceId,
      bike: parsed.data.bike,
      requirement: parsed.data.requirement,
      location: parsed.data.location,
      contact: parsed.data.contact,
      notes: parsed.data.notes,
      attachments,
    })
    return json({ reference }, 201)
  } catch (err) {
    return misfire('service.create', err)
  }
}
