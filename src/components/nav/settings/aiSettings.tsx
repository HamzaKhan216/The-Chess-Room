import { ConfigContext } from "@/context/config";
import { useContext } from "react";

export default function AISettings() {
    const { 
        groqApiKey: [groqKey, setGroqKey], 
        geminiApiKey: [geminiKey, setGeminiKey],
        aiProvider: [provider, setProvider],
        aiMode: [aiMode, setAiMode],
        autoAiReview: [autoReview, setAutoReview] 
    } = useContext(ConfigContext);

    return (
        <div className="flex flex-col gap-3 p-3 bg-backgroundBox rounded-borderRoundness border border-neutral-800">
            <span className="font-bold text-foregroundGrey text-sm uppercase tracking-wider">AI Coach Settings</span>
            
            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foregroundGrey uppercase">Provider</label>
                <div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg">
                    <button 
                        onClick={() => setProvider("groq")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${provider === "groq" ? "bg-highlightBrilliant text-white shadow-sm" : "text-foregroundGrey hover:text-white"}`}
                    >
                        GROQ
                    </button>
                    <button 
                        onClick={() => setProvider("gemini")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${provider === "gemini" ? "bg-highlightBrilliant text-white shadow-sm" : "text-foregroundGrey hover:text-white"}`}
                    >
                        GEMINI
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foregroundGrey uppercase">Coaching Mode</label>
                <div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg">
                    <button 
                        onClick={() => setAiMode("beginner")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${aiMode === "beginner" ? "bg-highlightBrilliant text-white shadow-sm" : "text-foregroundGrey hover:text-white"}`}
                    >
                        BEGINNER
                    </button>
                    <button 
                        onClick={() => setAiMode("advanced")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${aiMode === "advanced" ? "bg-highlightBrilliant text-white shadow-sm" : "text-foregroundGrey hover:text-white"}`}
                    >
                        ADVANCED
                    </button>
                </div>
            </div>

            {provider === "groq" ? (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-foregroundGrey">Groq API Key</label>
                    <input 
                        type="password" 
                        value={groqKey}
                        onChange={(e) => setGroqKey(e.target.value)}
                        placeholder="gsk_..."
                        className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm outline-none border border-transparent focus:border-highlightBrilliant transition-colors"
                    />
                </div>
            ) : (
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-foregroundGrey">Gemini API Key</label>
                    <input 
                        type="password" 
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="AIza..."
                        className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm outline-none border border-transparent focus:border-highlightBrilliant transition-colors"
                    />
                </div>
            )}

            <div className="flex flex-row justify-between items-center">
                <label className="text-xs font-semibold text-foregroundGrey cursor-pointer" onClick={() => setAutoReview(!autoReview)}>Auto AI Review</label>
                <div 
                    onClick={() => setAutoReview(!autoReview)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${autoReview ? 'bg-highlightBrilliant' : 'bg-backgroundProfileBlack'}`}
                >
                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${autoReview ? 'left-6' : 'left-1'}`} />
                </div>
            </div>
            
            <p className="text-[10px] text-foregroundGrey leading-tight italic">
                Get high-quality tactical explanations. Your key is stored locally.
            </p>
        </div>
    );
}
