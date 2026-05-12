import { useEffect, useRef, useState, useCallback } from 'react';
import { prepareStockfish, getAproxMemory, wasmSupported, wasmThreadsSupported } from '@/engine/wasmChecks'; // Need to check where these are
// Wait, I should import from where they are actually defined.
// prepareStockfish is in stockfish.ts
// getAproxMemory etc are in wasmChecks.ts

import { prepareStockfish as prepareEngine } from '@/engine/stockfish';
import { getAproxMemory as getMem, wasmSupported as wasmOk, wasmThreadsSupported as threadsOk } from '@/engine/wasmChecks';

export function useStockfish(setErrors: (title: string, message: string) => void) {
    const engineWorkerRef = useRef<Worker | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!threadsOk()) {
            if (!wasmOk()) {
                setErrors('WebAssembly not supported', 'The app may run very slow. Try updating your browser for better performance.');
                engineWorkerRef.current = new window.Worker(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/engine/stockfish-asm.js`);
            } else {
                engineWorkerRef.current = new window.Worker(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/engine/stockfish-single.js`);
            }
        } else {
            engineWorkerRef.current = new window.Worker(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/engine/stockfish.js`);
        }

        const stockfish = engineWorkerRef.current;
        const threads = navigator.hardwareConcurrency ?? 1;
        const hash = Math.floor(getMem() / 4);

        const errorTimeout = setTimeout(() => 
            setErrors('Engine Timeout', "The browser is having some troubles loading Stockfish. Try restarting the browser."), 
        15000);

        prepareEngine(stockfish, threads, hash).then(() => {
            clearTimeout(errorTimeout);
            setIsReady(true);
        });

        return () => {
            clearTimeout(errorTimeout);
            stockfish.terminate();
        };
    }, []);

    const postMessage = useCallback((message: string) => {
        engineWorkerRef.current?.postMessage(message);
    }, []);

    return {
        workerRef: engineWorkerRef,
        isReady,
        postMessage
    };
}
