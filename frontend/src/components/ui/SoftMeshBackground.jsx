import React from 'react';

// Fond doux façon "mesh gradient" (style Material/Gemini) : un dégradé
// statique aux quatre coins + des taches de couleur floutées et animées,
// toutes construites à partir des couleurs de la charte existante
// (navy #003058, vert #187840, or #FBBF24). Monté une seule fois à la
// racine de l'app, en position fixe derrière tout le contenu.
export default function SoftMeshBackground() {
    return (
        <>
            <div className="soft-mesh-bg" />
            <div className="soft-mesh-aura">
                <div className="soft-mesh-spot soft-mesh-spot-1" />
                <div className="soft-mesh-spot soft-mesh-spot-2" />
                <div className="soft-mesh-spot soft-mesh-spot-3" />
            </div>
        </>
    );
}
