import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BillCraft',
    short_name: 'BillCraft',
    description: 'BillCraft — Professional invoice generation system',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#125a98',
    orientation: 'portrait',
    icons: [
      {
        src: '/billCraftLogo.png',
        sizes: '512x512',
        type: 'image/png',
        // @ts-expect-error — purpose is valid in the spec but not yet in the Next.js type
        purpose: 'any maskable',
      },
    ],
  };
}
