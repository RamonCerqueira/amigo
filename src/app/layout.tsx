import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Amigo - Apoio Emocional',
    template: '%s | Amigo'
  },
  description: 'Sua plataforma de apoio emocional e desenvolvimento pessoal com conversas por voz empáticas e suporte especializado.',
  keywords: [
    'apoio emocional',
    'saúde mental',
    'conversa por voz',
    'prevenção suicídio',
    'bem-estar',
    'desenvolvimento pessoal',
    'ansiedade',
    'depressão',
    'CVV',
    'suporte psicológico'
  ],
  authors: [{ name: 'Equipe Amigo' }],
  creator: 'Amigo',
  publisher: 'Amigo',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://amigo.app',
    siteName: 'Amigo',
    title: 'Amigo - Apoio Emocional',
    description: 'Sua plataforma de apoio emocional e desenvolvimento pessoal com conversas por voz empáticas e suporte especializado.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Amigo - Apoio Emocional',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amigo - Apoio Emocional',
    description: 'Sua plataforma de apoio emocional e desenvolvimento pessoal com conversas por voz empáticas e suporte especializado.',
    images: ['/og-image.png'],
    creator: '@AmigoApp',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Amigo',
  },
  formatDetection: {
    telephone: false,
  },
  category: 'health',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3b82f6' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Amigo" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Amigo" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Preconnect para performance */}
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('✅ Service Worker registrado:', registration.scope);
                    })
                    .catch(function(error) {
                      console.error('❌ Erro ao registrar Service Worker:', error);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
