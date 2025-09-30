'use client';

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Listener para evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após 30 segundos se não estiver instalado
      setTimeout(() => {
        if (!isInstalled && !standalone) {
          setShowInstallPrompt(true);
        }
      }, 30000);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('✅ PWA foi instalado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ Usuário aceitou instalar o PWA');
      } else {
        console.log('❌ Usuário recusou instalar o PWA');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('installPromptDismissed', 'true');
  };

  // Não mostrar se já está instalado, em modo standalone, ou foi dispensado
  if (isInstalled || isStandalone || sessionStorage.getItem('installPromptDismissed')) {
    return null;
  }

  // Prompt para iOS (manual)
  if (isIOS && showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Smartphone className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800 mb-1">
              Instalar Amigo
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Para uma melhor experiência, adicione o Amigo à sua tela inicial:
            </p>
            <ol className="text-xs text-gray-600 space-y-1 mb-3">
              <li>1. Toque no ícone de compartilhar</li>
              <li>2. Selecione "Adicionar à Tela Inicial"</li>
              <li>3. Toque em "Adicionar"</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="text-xs text-yellow-600 hover:text-yellow-800"
            >
              Entendi
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Prompt para Android/Desktop
  if (deferredPrompt && showInstallPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Download className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800 mb-1">
              Instalar Amigo
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Instale o app para acesso rápido e funcionalidades offline.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors"
              >
                <Download className="w-3 h-3" />
                <span>Instalar</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Agora não
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Hook para detectar se é PWA
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
    setIsPWA(isStandalone);
  }, []);

  return isPWA;
}

// Hook para detectar se está online
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
