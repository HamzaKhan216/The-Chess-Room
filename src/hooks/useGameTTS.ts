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
    const timeoutRef = useRef<NodeJS.Timeout>();

    const enabledRef = useRef(enabled);
    const moveNumberRef = useRef(moveNumber);
    const gameRef = useRef(game);
    const playersRef = useRef(players);
    const onSpeakingChangeRef = useRef(onSpeakingChange);
    const onForwardRef = useRef(onForward);

    useEffect(() => {
        enabledRef.current = enabled;
        moveNumberRef.current = moveNumber;
        gameRef.current = game;
        playersRef.current = players;
        onSpeakingChangeRef.current = onSpeakingChange;
        onForwardRef.current = onForward;
    }, [enabled, moveNumber, game, players, onSpeakingChange, onForward]);

    useEffect(() => {
        if (!playing) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            return;
        }

        function playLoop() {
            const currentMoveNumber = moveNumberRef.current;
            const currentGame = gameRef.current;
            const currentPlayers = playersRef.current;
            const currentEnabled = enabledRef.current;

            const isSpeaking = speechService.isSpeaking();

            if (currentEnabled && isSpeaking) {
                timeoutRef.current = setTimeout(playLoop, 100);
                return;
            }

            if (currentEnabled && lastSpokenMoveRef.current !== currentMoveNumber) {
                const currentMove = currentGame[currentMoveNumber];
                const textToSpeak = currentMove?.aiComment || currentMove?.comment;
                
                if (textToSpeak) {
                    lastSpokenMoveRef.current = currentMoveNumber;
                    
                    const botName = currentPlayers.find(p => p.name !== "You")?.name || "";
                    const voice = speechService.findVoiceForBot(botName);

                    speechService.speak(
                        textToSpeak,
                        { voice },
                        () => onSpeakingChangeRef.current(true),
                        () => onSpeakingChangeRef.current(false),
                        () => onSpeakingChangeRef.current(false)
                    );
                    
                    timeoutRef.current = setTimeout(playLoop, 100);
                    return;
                }
            }

            onForwardRef.current();
            timeoutRef.current = setTimeout(playLoop, 1000);
        }

        lastSpokenMoveRef.current = -1;
        timeoutRef.current = setTimeout(playLoop, 1000);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            speechService.cancel();
        };
    }, [playing]);

    return {
        cancel: () => speechService.cancel()
    };
}
