// src/components/ui/Toast.jsx
// Ce composant utilise createPortal pour rendre les toasts directement
// dans document.body, évitant le bug de position: fixed dans les parents
// avec des transformations CSS (framer-motion).
import { createPortal } from 'react-dom';

/**
 * @param {{ msg: string, type?: 'success' | 'error' }} props
 */
export default function Toast({ msg, type = 'success' }) {
    if (!msg) return null;
    return createPortal(
        <div
            className={`fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-xl text-white text-xs font-bold shadow-2xl transition-all animate-fade-in
                ${type === 'error' ? 'bg-red-500' : 'bg-[#187840]'}
            `}
            style={{ boxShadow: type === 'error' ? '0 8px 24px rgba(239,68,68,0.4)' : '0 8px 24px rgba(24,120,64,0.4)' }}
        >
            {msg}
        </div>,
        document.body
    );
}
