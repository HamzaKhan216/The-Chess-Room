import { useEffect, useRef } from 'react';

interface ControlsProps {
    onBack: () => void;
    onForward: () => void;
    onFirst: () => void;
    onLast: () => void;
    onTogglePlay: () => void;
    onTabSwitch: () => void;
    canControl: boolean;
}

export function useGameControls({
    onBack,
    onForward,
    onFirst,
    onLast,
    onTogglePlay,
    onTabSwitch,
    canControl
}: ControlsProps) {
    const lastPressedRef = useRef<number>(0);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (!canControl) return;

            const element = e.target as HTMLElement;
            const focusableInputTypes = ['text', 'number', 'password', 'email', 'search', 'tel', 'url'];
            if (element.tagName === 'INPUT' && focusableInputTypes.includes(element.getAttribute('type') ?? '')) return;
            if (element.tagName === 'TEXTAREA') return;

            const now = new Date().getTime();
            const minPressInterval = 25;
            if (now - lastPressedRef.current < minPressInterval) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    onBack();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    onForward();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    onFirst();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    onLast();
                    break;
                case ' ':
                    e.preventDefault();
                    onTogglePlay();
                    break;
                case 'Tab':
                    e.preventDefault();
                    onTabSwitch();
                    break;
                default:
                    return;
            }
            lastPressedRef.current = now;
        }

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [canControl, onBack, onForward, onFirst, onLast, onTogglePlay, onTabSwitch]);
}
