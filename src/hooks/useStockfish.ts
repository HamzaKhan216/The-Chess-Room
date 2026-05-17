import { useEffect, useRef, useState, useCallback } from 'react';

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

        stockfish.onerror = (e) => {
            console.error("Stockfish worker error:", e);
            setErrors('Engine Error', "There was an error initializing the Stockfish engine. Make sure your browser supports WebAssembly and threads, and you have a stable network to download the engine files.");
        };

        const errorTimeout = setTimeout(() => 
            setErrors('Engine Timeout', "The browser is taking longer than expected to download the Chess Engine. If your connection is slow, it may take up to a minute on the first load (approx. 69 MB). Try waiting a bit longer or restarting your browser."), 
        90000);

        prepareEngine(stockfish, threads, hash)
            .then(() => {
                clearTimeout(errorTimeout);
                setIsReady(true);
            })
            .catch((err) => {
                console.error("Stockfish initialization rejected:", err);
                clearTimeout(errorTimeout);
                setErrors('Engine Error', "Failed to prepare the chess engine. Please try reloading the page or restarting your browser.");
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
