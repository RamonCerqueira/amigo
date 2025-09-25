const CACHE_NAME = 'amigo-v1.0.0';
const STATIC_CACHE_NAME = 'amigo-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'amigo-dynamic-v1.0.0';

// Recursos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/login',
  '/registro',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Recursos que podem ser cacheados dinamicamente
const CACHEABLE_ROUTES = [
  '/api/auth/',
  '/api/usuarios/',
  '/api/dashboard'
];

// Recursos que nunca devem ser cacheados
const NEVER_CACHE = [
  '/api/conversas/openai',
  '/api/audio/',
  '/api/alertas',
  '/admin'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Instalação concluída');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('amigo-')) {
              console.log('🗑️ Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Ativação concluída');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não devem ser cacheadas
  if (NEVER_CACHE.some(route => url.pathname.startsWith(route))) {
    return;
  }

  // Estratégia para recursos estáticos
  if (STATIC_ASSETS.includes(url.pathname) || 
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icons/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estratégia para APIs cacheáveis
  if (CACHEABLE_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estratégia para páginas HTML
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/'));
    return;
  }

  // Para outros recursos, tentar rede primeiro
  event.respondWith(networkFirst(request));
});

// Estratégia Cache First (para recursos estáticos)
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('❌ Cache First falhou:', error);
    return new Response('Recurso não disponível offline', { status: 503 });
  }
}

// Estratégia Network First (para APIs e páginas)
async function networkFirst(request, fallbackUrl = null) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear resposta se for cacheável
      if (request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Rede indisponível, tentando cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fallback para páginas de navegação
    if (fallbackUrl && request.mode === 'navigate') {
      const fallbackResponse = await caches.match(fallbackUrl);
      if (fallbackResponse) {
        return fallbackResponse;
      }
    }

    // Resposta offline personalizada
    return new Response(
      JSON.stringify({
        error: 'Você está offline',
        message: 'Verifique sua conexão com a internet e tente novamente.',
        offline: true
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Sincronização em background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingData());
  }
});

// Sincronizar dados pendentes
async function syncPendingData() {
  try {
    // Verificar se há dados pendentes no IndexedDB
    // Implementar lógica de sincronização quando voltar online
    console.log('📡 Sincronizando dados pendentes...');
    
    // TODO: Implementar sincronização de conversas offline
    // TODO: Implementar sincronização de dados de usuário
    
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  }
}

// Notificações push
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Notificação push recebida');
  
  const options = {
    body: 'Você tem uma nova mensagem no Amigo',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir Amigo',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/action-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('Amigo', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Service Worker: Clique em notificação');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já há uma janela aberta
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Abrir nova janela se necessário
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Mensagem recebida:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Tratamento de erros
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker: Erro:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker: Promise rejeitada:', event.reason);
  event.preventDefault();
});
