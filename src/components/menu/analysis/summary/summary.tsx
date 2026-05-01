import { useEffect, useRef, useState } from "react";
import { players } from "@/context/analyze";
import RatingCount from "./ratingCount";
import PlayersAccuracy from "./playersAccuracy";
import GameRating from "./gameRating";
import { accuracyPhases } from "./playersAccuracy";
import { move } from "@/engine/stockfish";
import GameChart from "../gameChart";
import { reduceSummary } from "../../../../../tailwind.config";
import { getAIExplanations, AIExplanationRequest } from "@/engine/aiCoach";
import { ConfigContext } from "@/context/config";
import { AnalyzeContext } from "@/context/analyze";
import { ErrorsContext } from "@/context/errors";
import { pushPageSuccess } from "@/components/errors/pageErrors";
import { useContext } from "react";

export default function Summary(props: { moves: move[], container: HTMLElement, players: players, moveNumber: number, setMoveNumber: (moveNumber: number) => void, setAnimation: (animation: boolean) => void, setForward: (forward: boolean) => void }) {
    const { moves, container, players, moveNumber, setMoveNumber, setAnimation, setForward } = props

    const [reducedSummary, setReducedSummary] = useState(false)

    const componentRef = useRef<HTMLDivElement>(null)

    const [accuracy, setAccuracy] = useState({ w: NaN, b: NaN })
    const [accuracyPhases, setAccuracyPhases] = useState<accuracyPhases>({ opening: { w: [], b: [] }, middlegame: { w: [], b: [] }, endgame: { w: [], b: [] } })

    const {
        groqApiKey: [groqKey],
        geminiApiKey: [geminiKey],
        aiProvider: [provider],
        aiMode: [aiMode, setAiMode]
    } = useContext(ConfigContext);
    const { game: [, setGame], tab: [, setTab] } = useContext(AnalyzeContext);
    const { errors: [, setErrors] } = useContext(ErrorsContext);
    const [loadingAI, setLoadingAI] = useState(false);
    const [showPerspectiveModal, setShowPerspectiveModal] = useState(false);

    const handleAIReview = async (perspective: 'w' | 'b') => {
        setShowPerspectiveModal(false);
        const apiKey = provider === "groq" ? groqKey : geminiKey;
        if (!apiKey) {
            alert(`Please set your ${provider === "groq" ? "Groq" : "Gemini"} API Key in Settings first!`);
            return;
        }

        const movesToReview: AIExplanationRequest[] = [];
        moves.forEach((move, index) => {
            if (['brilliant', 'great', 'blunder', 'mistake', 'miss', 'inaccuracy'].includes(move.moveRating || '')) {
                const colorWhoPlayed = move.color === 'w' ? 'b' : 'w';
                const isUser = colorWhoPlayed === perspective;
                const playedBy = isUser ? "User" : "Opponent";

                movesToReview.push({
                    moveIndex: index,
                    san: move.san || '',
                    rating: move.moveRating || '',
                    evalBefore: move.previousStaticEvals?.[1]?.[1] || '0',
                    evalAfter: move.previousStaticEvals?.[0]?.[1] || '0',
                    bestMove: moves[index - 1]?.bestMoveSan,
                    fen: move.fen,
                    playedBy: playedBy,
                    capturedPiece: move.capture ? { 'p': 'Pawn', 'n': 'Knight', 'b': 'Bishop', 'r': 'Rook', 'q': 'Queen' }[move.capture.toLowerCase()] : undefined
                });
            }
        });

        if (movesToReview.length === 0) {
            alert("No significant moves found to review.");
            return;
        }

        setLoadingAI(true);
        try {
            const rawExplanations = await getAIExplanations(apiKey, movesToReview, provider, aiMode);
            console.log("AI Coach Response:", rawExplanations);

            // Handle potential wrapping by the AI
            const explanations = (rawExplanations as any).explanations || (rawExplanations as any).moves || rawExplanations;

            setGame(prev => {
                const newGame = prev.map((move, index) => {
                    const aiExpl = explanations[index] || explanations[index.toString()];
                    if (aiExpl) {
                        console.log(`Matching explanation for move ${index}:`, aiExpl);
                    }
                    return {
                        ...move,
                        aiComment: aiExpl || move.aiComment
                    };
                });
                return newGame;
            });

            pushPageSuccess(setErrors, "Insights Generated!", "Moving to the board...");
            setTimeout(() => {
                setTab('moves');
            }, 1500);
        } catch (error) {
            alert("AI Review failed. Check console for details.");
        } finally {
            setLoadingAI(false);
        }
    };

    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            entries.forEach(() => {
                setReducedSummary(window.innerWidth < reduceSummary)
            })
        })

        const component = componentRef.current

        if (!component) return

        observer.observe(component)
    }, [])

    return (
        <div ref={componentRef} className="flex flex-col gap-3 items-center">
            <GameChart setMoveNumber={setMoveNumber} moves={moves} container={container} moveNumber={moveNumber} setAnimation={setAnimation} setForward={setForward} />
            <PlayersAccuracy reducedSummary={reducedSummary} setAccuracyPhases={setAccuracyPhases} accuracy={[accuracy, setAccuracy]} players={players} moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <RatingCount moves={moves} />
            <hr className="border-neutral-600 w-[85%]" />
            <GameRating reducedSummary={reducedSummary} accuracy={accuracy} accuracyPhases={accuracyPhases} />
            
            <div className="w-[85%] flex flex-col gap-2 mt-2">
                <div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg border border-neutral-700">
                    <button 
                        onClick={() => setAiMode("beginner")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiMode === "beginner" ? "bg-highlightBrilliant text-white shadow-md scale-[1.02]" : "text-foregroundGrey hover:text-white"}`}
                    >
                        BEGINNER
                    </button>
                    <button 
                        onClick={() => setAiMode("advanced")}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${aiMode === "advanced" ? "bg-highlightBrilliant text-white shadow-md scale-[1.02]" : "text-foregroundGrey hover:text-white"}`}
                    >
                        ADVANCED
                    </button>
                </div>

                <button
                    onClick={() => setShowPerspectiveModal(true)}
                    disabled={loadingAI}
                    className="w-full bg-highlightBrilliant hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded-borderRoundness transition-all flex flex-row justify-center items-center gap-2 mb-4 shadow-lg active:scale-95"
                >
                {loadingAI ? (
                    <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Generating Insights...
                    </>
                ) : (
                    <>
                        Get AI Insights
                    </>
                )}
                </button>

                {showPerspectiveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-backgroundProfileBlack border border-neutral-700 p-6 rounded-lg shadow-xl w-80 text-center">
                            <h3 className="text-white font-bold mb-4">Analyze from whose perspective?</h3>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => handleAIReview('w')} 
                                    className="bg-white text-black py-2 rounded-md font-bold hover:bg-gray-200"
                                >
                                    Play as White ({players[0].name})
                                </button>
                                <button 
                                    onClick={() => handleAIReview('b')} 
                                    className="bg-neutral-800 text-white py-2 rounded-md font-bold border border-neutral-600 hover:bg-neutral-700"
                                >
                                    Play as Black ({players[1].name})
                                </button>
                                <button 
                                    onClick={() => setShowPerspectiveModal(false)} 
                                    className="mt-2 text-foregroundGrey hover:text-white text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}