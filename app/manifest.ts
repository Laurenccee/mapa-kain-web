// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stamp Rewards App',
    short_name: 'StampRewards',
    description: 'Scan QR codes and collect stamps to earn exciting rewards!',
    start_url: '/',
    display: 'standalone', // Makes it look like a native app (hides browser URL bar)
    background_color: '#ffffff', // Background color while loading the splash screen
    theme_color: '#00613C', // Matches your primary green theme for the system status bar
    orientation: 'portrait', // Locks the app layout to portrait mode on mobile
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable', // Allows Android to crop the icon shape cleanly
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
