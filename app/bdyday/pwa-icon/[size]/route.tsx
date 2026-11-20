import { iconImage } from '../../_lib/icon'

const SIZES = [192, 512]

/** PNG icons for the web app manifest (public/bdyday/manifest.webmanifest). */
export async function GET(_req: Request, ctx: RouteContext<'/bdyday/pwa-icon/[size]'>) {
  const size = Number((await ctx.params).size)
  if (!SIZES.includes(size)) return new Response('Not found', { status: 404 })
  return iconImage(size)
}

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }))
}
