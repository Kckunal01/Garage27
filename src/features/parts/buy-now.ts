/** BUY NOW goes straight to checkout for exactly this part (see app/checkout). */
export const buyNowHref = (slug: string, quantity = 1) => `/checkout?buy=${encodeURIComponent(slug)}&qty=${Math.max(1, Math.floor(quantity))}`
