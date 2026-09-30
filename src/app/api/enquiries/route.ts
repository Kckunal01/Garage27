import { enquirySchema } from '@/lib/validation/schemas'
import { clientIp, invalid, isSameOrigin, json, misfire, rateLimited, readReferenceFiles } from '@/lib/server/http'
import { getStore, makeReference } from '@/lib/server/store'
import { storeReferenceImages } from '@/lib/storage/references'

export const dynamic = 'force-dynamic'

/** About → LET'S TALK. Free-form enquiry + optional references (images / PDF / link). */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  if (rateLimited(`enquiry:${clientIp(req)}`, 5)) return json({ error: 'Easy on the throttle — try again in a minute.' }, 429)

  let form: FormData
  let payload: unknown
  try {
    form = await req.formData()
    payload = JSON.parse(String(form.get('payload') ?? ''))
  } catch {
    return json({ error: 'Bad request' }, 400)
  }
  const parsed = enquirySchema.safeParse(payload)
  if (!parsed.success) return invalid(parsed.error)

  const files = await readReferenceFiles(form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0))
  if (!files.ok) return json({ error: files.error, fields: { files: files.error } }, 422)

  try {
    const reference = makeReference('E')
    const attachments = await storeReferenceImages('enquiries', reference, files.files)
    await getStore().insertEnquiry({
      reference,
      name: parsed.data.name,
      reach: parsed.data.reach,
      message: parsed.data.message,
      link: parsed.data.link || undefined,
      attachments,
    })
    return json({ reference }, 201)
  } catch (err) {
    return misfire('enquiry.create', err)
  }
}
