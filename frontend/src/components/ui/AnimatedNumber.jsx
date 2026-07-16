import React, { useState, useEffect } from 'react';

/**
 * Composant d'animation de défilement de chiffres.
 * Il anime une valeur numérique de 0 à sa valeur cible en utilisant requestAnimationFrame.
 * 
 * @param {object} props
 * @param {number|string} props.value - La valeur finale à atteindre.
 * @param {number} [props.duration] - Durée de l'animation en millisecondes (défaut: 1200ms).
 * @param {function} [props.formatter] - Fonction de formatage optionnelle pour l'affichage (ex: ajout de devise).
 */
export default function AnimatedNumber({ value, duration = 1200, formatter = (v) => v }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const end = parseInt(value, 10);
        if (isNaN(end)) {
            setDisplayValue(value);
            return;
        }

        let startTimestamp = null;
        const startValue = 0;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing de type easeOutQuad
            const easeProgress = progress * (2 - progress);
            const current = Math.floor(easeProgress * (end - startValue) + startValue);
            
            setDisplayValue(current);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(end);
            }
        };

        window.requestAnimationFrame(step);
    }, [value, duration]);

    return <span>{formatter(displayValue)}</span>;
}
