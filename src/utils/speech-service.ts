export type BotVoiceType = 'Jimmy' | 'Scarlett' | 'Magnus' | 'Default';

export interface SpeechOptions {
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
}

class SpeechService {
    private synthesis: SpeechSynthesis | null = null;
    private currentUtterance: SpeechSynthesisUtterance | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.synthesis = window.speechSynthesis;
        }
    }

    public getVoices(): SpeechSynthesisVoice[] {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }

    public findVoiceForBot(botName: string): SpeechSynthesisVoice | undefined {
        const voices = this.getVoices();
        
        if (botName.includes("Jimmy")) {
            return voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Male')));
        } else if (botName.includes("Scarlett")) {
            return voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female')));
        } else if (botName.includes("Magnus")) {
            return voices.find(v => v.lang.startsWith('en') && (v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('UK') || v.name.includes('GB')));
        }
        
        return voices.find(v => v.name === 'Google US English' || v.name.includes('Natural') || v.name.includes('Premium'));
    }

    public speak(text: string, options: SpeechOptions = {}, onStart?: () => void, onEnd?: () => void, onError?: () => void) {
        if (!this.synthesis) return;

        this.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate ?? 1.0;
        utterance.pitch = options.pitch ?? 1.0;
        
        if (options.voice) {
            utterance.voice = options.voice;
        }

        utterance.onstart = onStart ?? null;
        utterance.onend = onEnd ?? null;
        utterance.onerror = onError ?? null;

        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);
    }

    public cancel() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        this.currentUtterance = null;
    }

    public isSpeaking(): boolean {
        return this.synthesis?.speaking ?? false;
    }
}

export const speechService = new SpeechService();
