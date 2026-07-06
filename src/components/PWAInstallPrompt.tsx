import { useState, useEffect } from 'react'
import { Download, X, Smartphone, Tablet, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setIsVisible(true), 2000)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsVisible(false)
    await deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
    } else {
      setIsVisible(true)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-fade-in-up">
      <div className={cn(
        'rounded-2xl glass-card shadow-soft-lg',
        'backdrop-blur-xl'
      )}>
        <div className="flex items-start gap-3 p-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-glow-soft">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-dream-slate-800">安装到桌面</h3>
            <p className="mt-1 text-sm text-dream-blue-500">
              将工作台添加到主屏幕，像原生应用一样使用
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-lg text-dream-blue-400 hover:text-dream-blue-600 hover:bg-dream-blue-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 pb-2">
          <div className="flex items-center justify-center gap-4 text-xs text-dream-blue-400 mb-3">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              手机
            </span>
            <span className="flex items-center gap-1">
              <Tablet className="w-3 h-3" />
              平板
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              电脑
            </span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium',
                'gradient-btn text-white shadow-soft',
                'hover:shadow-soft-lg active:scale-95',
                'transition-all duration-200'
              )}
            >
              立即安装
            </button>
            <button
              onClick={handleDismiss}
              className={cn(
                'px-4 py-2.5 rounded-xl text-sm font-medium',
                'bg-dream-blue-50 text-dream-blue-600',
                'hover:bg-dream-blue-100 active:scale-95',
                'transition-all duration-200'
              )}
            >
              稍后
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
