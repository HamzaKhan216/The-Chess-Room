import { useEffect, useRef } from 'react';
import { speechService } from '@/utils/speech-service';
import { move } from '@/engine/stockfish';

interface TTSHookProps {
    enabled: boolean;
    playing: boolean;
    moveNumber: number;
    game: move[];
    players: { name: string }[];
    onSpeakingChange: (isSpeaking: boolean) => void;
    onForward: () => void;
}

export function useGameTTS({
    enabled,
    playing,
    moveNumber,
    game,
    players,
    onSpeakingChange,
    onForward
}: TTSHookProps) {
    const lastSpokenMoveRef = useRef<number>(-1);
    const intervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (!playing) {
            if (intervalRef.current) clearTimeout(intervalRef.current);
            return;
        }

        function playLoop() {
            const isSpeaking = speechService.isSpeaking();

            if (enabled && isSpeaking) {
                intervalRef.current = setTimeout(playLoop, 100);
                return;
            }

            if (enabled && lastSpokenMoveRef.current !== moveNumber) {
                const currentMove = game[moveNumber];
                const textToSpeak = currentMove?.aiComment || currentMove?.comment;
                
                if (textToSpeak) {
                    lastSpokenMoveRef.current = moveNumber;
                    
                    const botName = players.find(p => p.name !== "You")?.name || "";
                    const voice = speechService.findVoiceForBot(botName);

                    speechService.speak(
                        textToSpeak,
                        { voice },
                        () => onSpeakingChange(true),
                        () => onSpeakingChange(false),
                        () => onSpeakingChange(false)
                    );
                    
                    intervalRef.current = setTimeout(playLoop, 100);
                    return;
                }
            }

            onForward();
            intervalRef.current = setTimeout(playLoop, 1000);
        }

        intervalRef.current = setTimeout(playLoop, 1000);

        return () => {
            if (intervalRef.current) clearTimeout(intervalRef.current);
            speechService.cancel();
        };
    }, [playing, moveNumber, enabled]);

    return {
        cancel: () => speechService.cancel()
    };
}
