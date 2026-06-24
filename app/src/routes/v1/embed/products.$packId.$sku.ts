import { createFileRoute } from '@tanstack/react-router'
import type { NordicLang } from '@shared/manifest.types'
import { api } from '../../../../convex/_generated/api'
import {
  renderProductEmbedError,
  renderProductEmbedHtml,
} from '#/lib/embed/renderProduct'
import type { EmbedProduct } from '#/lib/embed/types'
import { corsPreflightResponse, withCors } from '#/lib/cors'
import { getConvexClient } from '#/lib/convex/server'

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=60',
} as const

const VALID_LANGS = new Set<NordicLang>(['sv', 'no', 'da', 'fi'])

function parseLang(value: string | null): NordicLang {
  if (value && VALID_LANGS.has(value as NordicLang)) {
    return value as NordicLang
  }
  return 'sv'
}

export const Route = createFileRoute('/v1/embed/products/$packId/$sku')({
  server: {
    handlers: {
      OPTIONS: () => corsPreflightResponse(),
      GET: async ({ params, request }) => {
        const url = new URL(request.url)
        const lang = parseLang(url.searchParams.get('lang'))
        const distributor = url.searchParams.get('distributor')?.trim() || undefined

        const client = getConvexClient()
        const product = (await client.query(api.packs.getProductForEmbed, {
          packId: params.packId,
          sku: params.sku,
          lang,
        })) as EmbedProduct | null

        if (!product) {
          return new Response(renderProductEmbedError('Product not found'), {
            status: 404,
            headers: withCors(HTML_HEADERS),
          })
        }

        const html = renderProductEmbedHtml(product, { lang, distributor })
        return new Response(html, {
          status: 200,
          headers: withCors(HTML_HEADERS),
        })
      },
    },
  },
})
