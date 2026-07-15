import React, { useState, useEffect } from 'react';
import { Download } from './Icons';

// Bouton d'installation PWA — n'est rendu que dans les espaces connectés
// (Admin/Étudiant), jamais sur les pages publiques.
export default function InstallAppButton({ className = '' }) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [installed, setInstalled] = useState(
        window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    );

    useEffect(() => {
        const onBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        const onAppInstalled = () => {
            setInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
        window.addEventListener('appinstalled', onAppInstalled);
        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
            window.removeEventListener('appinstalled', onAppInstalled);
        };
    }, []);

    if (installed || !deferredPrompt) return null;

    const handleInstall = async () => {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
    };

    return (
        <button
            onClick={handleInstall}
            title="Installer l'application Club-MET"
            className={`flex items-center gap-2 text-xs font-bold text-[#187840] hover:bg-[#187840]/10 px-3 py-2 rounded-xl transition-colors ${className}`}
        >
            <Download size={16} />
            <span className="hidden sm:inline">Télécharger l'app</span>
        </button>
    );
}
