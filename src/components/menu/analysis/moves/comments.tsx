import { useEffect, useContext } from "react"
import RatingSVG from "@/components/svg/rating"
import { moveRating } from "@/engine/stockfish"
import { ConfigContext } from "@/context/config"
import { AnalyzeContext } from "@/context/analyze"

const RATING_FORMATS_GUIDE = {
    _isA_Move: 'is a _ move',
    _isAn_Move: 'is an _ move',
    _is_: 'is _',
    _isAn_: 'is an _',
    _isA_: 'is a _',
}

const RATING_FORMATS = {
    book: RATING_FORMATS_GUIDE._isA_Move,
    forced: RATING_FORMATS_GUIDE._is_,
    brilliant: RATING_FORMATS_GUIDE._is_,
    great: RATING_FORMATS_GUIDE._isA_Move,
    best: RATING_FORMATS_GUIDE._is_,
    excellent: RATING_FORMATS_GUIDE._is_,
    good: RATING_FORMATS_GUIDE._is_,
    inaccuracy: RATING_FORMATS_GUIDE._isAn_,
    mistake: RATING_FORMATS_GUIDE._isA_,
    miss: RATING_FORMATS_GUIDE._isA_,
    blunder: RATING_FORMATS_GUIDE._isA_,
}

export function FormatEval(props: { evaluation: string[], white: boolean, smaller?: boolean, best?: boolean }) {
    const { evaluation, white, smaller, best } = props

    const number = (Number(evaluation[1]) / 100) * (white ? 1 : -1)

    let prevChar = ''
    if (number > 0) prevChar = '+'
    if (number < 0) prevChar = '-'

    return (
        <div style={{ fontSize: smaller ? "14px" : "", padding: smaller ? "2px" : "", width: smaller ? "46px" : "", backgroundColor: prevChar === '-' ? 'var(--evaluationBarBlack)' : 'var(--evaluationBarWhite)', color: prevChar === '-' ? 'var(--foreground)' : 'var(--foregroundBlack)', filter: prevChar === '-' ? '' : 'brightness(0.9)' }} className="rounded-borderRoundness py-1 font-extrabold w-[61px] text-center">
            {(() => {
                if (evaluation[0] === 'mate' && evaluation[1]) {
                    return prevChar + "M" + (Math.abs(Number(evaluation[1])) - Number(Boolean(best)))
                } else if (!evaluation[1]) {
                    if (white) return '0-1'
                    else return '1-0'
                } else {
                    return prevChar + Math.abs(number).toFixed(2)
                }
            })()}
        </div>
    )
}

export default function Comments(props: { aiComment?: string, comment?: string, rating?: moveRating, moveSan?: string, evaluation: string[], white: boolean, overallGameComment: string, moveNumber?: number }) {
    const { aiComment, comment, rating, moveSan, evaluation, white, overallGameComment, moveNumber } = props
    const { ttsEnabled: [ttsEnabled, setTtsEnabled], ttsSpeaking: [, setTtsSpeaking] } = useContext(ConfigContext);
    const { players: [players] } = useContext(AnalyzeContext);

    useEffect(() => {
        if (!ttsEnabled) {
            window.speechSynthesis.cancel();
            setTtsSpeaking(false);
            return;
        }

        const textToSpeak = aiComment || comment;
        if (textToSpeak) {
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            const botName = players.find(p => p.name !== "You")?.name || "";
            const voices = window.speechSynthesis.getVoices();
            let voice;

            if (botName.includes("Jimmy")) {
                voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('David') || v.name.includes('Alex') || v.name.includes('Male')));
            } else if (botName.includes("Scarlett")) {
                voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Female')));
            } else if (botName.includes("Magnus")) {
                voice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('George') || v.name.includes('Daniel') || v.name.includes('UK') || v.name.includes('GB')));
            }

            if (!voice) {
                // Fallback to high quality voices if available
                voice = voices.find(v => v.name === 'Google US English' || v.name.includes('Natural') || v.name.includes('Premium'));
            }

            if (voice) {
                utterance.voice = voice;
            }

            utterance.onstart = () => setTtsSpeaking(true);
            utterance.onend = () => setTtsSpeaking(false);
            utterance.onerror = () => setTtsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        } else {
            setTtsSpeaking(false);
        }

        return () => {
            window.speechSynthesis.cancel();
            setTtsSpeaking(false);
        };
    }, [aiComment, comment, ttsEnabled]);

    if (!moveSan || moveNumber === 0) {
        if (overallGameComment && (moveNumber === -1 || !moveSan)) {
            return (
                <div className="bg-white w-[85%] rounded-borderExtraRoundness p-4 font-bold text-lg text-foregroundBlack" dangerouslySetInnerHTML={{ __html: overallGameComment }} />
            )
        } else {
            return (
                <div style={{ backgroundColor: "#ffffff" }} className="h-44 w-[85%] p-4 rounded-borderExtraRoundness text-foregroundBlack text-lg font-bold flex flex-col items-center justify-center">
                    <span className="text-neutral-400">Game Started</span>
                </div>
            )
        }
    }

    const displayRating = rating || 'good'

    return (
        <div style={{ backgroundColor: "#ffffff" }} className="h-44 w-[85%] p-4 rounded-borderExtraRoundness text-foregroundBlack text-lg font-bold flex flex-col gap-1 overflow-y-auto relative group">
            <button
                onClick={() => setTtsEnabled(!ttsEnabled)}
                className="absolute top-2 right-2 p-1 rounded-md hover:bg-neutral-200 transition-colors z-10"
                title={ttsEnabled ? "Mute Commentary" : "Unmute Commentary"}
            >
                {ttsEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foregroundBlack"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                )}
            </button>

            <div className="flex flex-row justify-between items-center pr-8">
                <div className="flex flex-row items-center gap-2">
                    <RatingSVG draggable rating={displayRating} size={32} />
                    <span>{moveSan} {RATING_FORMATS[displayRating].replace('_', displayRating)}</span>
                </div>
                <FormatEval evaluation={evaluation} white={white} />
            </div>
            {aiComment ? (
                <div className="flex flex-col gap-1 p-2 rounded-lg bg-highlightBrilliant/10 border-l-4 border-highlightBrilliant">
                    <div className="text-xs text-highlightBrilliant uppercase tracking-wider font-bold"> AI Insight</div>
                    <div className="text-base font-medium italic leading-snug">
                        {aiComment}
                    </div>
                </div>
            ) : (
                <div className="text-base font-medium pr-2">
                    {comment}
                </div>
            )}
        </div>
    )
}
