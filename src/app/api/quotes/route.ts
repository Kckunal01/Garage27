import { getCatalogue } from '@/lib/catalogue/repository'
import { estimateBuild, getBikeBundle, validateConfiguration } from '@/features/build/engine'
import { quoteRequestSchema } from '@/lib/validation/schemas'
import { clientIp, invalid, isSameOrigin, json, misfire, rateLimited, readImageFiles } from '@/lib/server/http'
import { getStore, makeReference } from '@/lib/server/store'
import { storeReferenceImages } from '@/lib/storage/references'

export const dynamic = 'force-dynamic'

/**
 * Create a custom-build quote. The server re-validates the configuration
 * against the live catalogue and calculates the authoritative price snapshot;
 * the client's estimate is never trusted.
 */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return json({ error: 'Forbidden' }, 403)
  if (rateLimited(`quote:${clientIp(req)}`, 5)) return json({ error: 'Easy on the throttle — try again in a minute.' }, 429)

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return json({ error: 'Bad request' }, 400)
  }
  let payload: unknown
  try {
    payload = JSON.parse(String(form.get('payload') ?? ''))
  } catch {
    return json({ error: 'Bad request' }, 400)
  }
  const parsed = quoteRequestSchema.safeParse(payload)
  if (!parsed.success) return invalid(parsed.error)

  const files = await readImageFiles(form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0))
  if (!files.ok) return json({ error: files.error, fields: { files: files.error } }, 422)

  try {
    const catalogue = await getCatalogue()
    const bundle = getBikeBundle(catalogue, parsed.data.configuration.bikeId)
    if (!bundle || bundle.bike.status === 'coming-soon' || bundle.bike.status === 'retired') {
      return json({ error: 'THIS BIKE IS STILL IN THE WORKSHOP.' }, 422)
    }
    // Preview-only bikes have no slots: the quote carries bike + colour + notes.
    const issues = validateConfiguration(parsed.data.configuration, bundle)
    if (issues.length) return json({ error: "THIS OPTION DOESN'T FIT THIS BUILD.", issues }, 422)

    const estimate = estimateBuild(parsed.data.configuration, bundle)
    const reference = makeReference('Q')
    const attachments = await storeReferenceImages('quotes', reference, files.files)
    await getStore().insertQuote({
      reference,
      configuration: parsed.data.configuration,
      priceSnapshot: estimate,
      estimatedTotal: estimate.total,
      contact: parsed.data.contact,
      city: parsed.data.city,
      notes: parsed.data.notes,
      attachments,
    })
    return json({ reference, estimatedTotal: estimate.total }, 201)
  } catch (err) {
    return misfire('quote.create', err)
  }
}
