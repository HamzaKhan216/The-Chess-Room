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
                <div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg border border-transparent">
                    <button 
                        onClick={() => setProvider("groq")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ease-out active:scale-95 ${
                            provider === "groq" 
                            ? "bg-backgroundBoxBoxHighlighted shadow-sm" 
                            : "text-foregroundGrey hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        GROQ
                    </button>
                    <button 
                        onClick={() => setProvider("gemini")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ease-out active:scale-95 ${
                            provider === "gemini" 
                            ? "bg-backgroundBoxBoxHighlighted shadow-sm" 
                            : "text-foregroundGrey hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        GEMINI
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-foregroundGrey uppercase">Coaching Mode</label>
                <div className="flex flex-row gap-2 bg-backgroundProfileBlack p-1 rounded-lg border border-transparent">
                    <button 
                        onClick={() => setAiMode("beginner")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ease-out active:scale-95 ${
                            aiMode === "beginner" 
                            ? "bg-backgroundBoxBoxHighlighted shadow-sm" 
                            : "text-foregroundGrey hover:text-white hover:bg-white/[0.04]"
                        }`}
                    >
                        BEGINNER
                    </button>
                    <button 
                        onClick={() => setAiMode("advanced")}
                        className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all duration-150 ease-out active:scale-95 ${
                            aiMode === "advanced" 
                            ? "bg-backgroundBoxBoxHighlighted shadow-sm" 
                            : "text-foregroundGrey hover:text-white hover:bg-white/[0.04]"
                        }`}
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
                        className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm outline-none border border-transparent focus:border-backgroundBoxBoxHighlighted transition-colors"
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
                        className="bg-backgroundProfileBlack text-white p-2 rounded-borderRoundness text-sm outline-none border border-transparent focus:border-backgroundBoxBoxHighlighted transition-colors"
                    />
                </div>
            )}

            <div className="flex flex-row justify-between items-center py-1">
                <label className="text-xs font-semibold text-foregroundGrey cursor-pointer hover:text-white transition-colors" onClick={() => setAutoReview(!autoReview)}>Auto AI Review</label>
                <div 
                    onClick={() => setAutoReview(!autoReview)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-all duration-200 ${
                        autoReview 
                        ? 'bg-backgroundBoxBoxHighlighted shadow-sm shadow-backgroundBoxBoxHighlighted/30' 
                        : 'bg-white/[0.06] hover:bg-white/[0.1]'
                    }`}
                >
                    <div className={`absolute top-[4px] w-3 h-3 rounded-full bg-white transition-all duration-200 ${autoReview ? 'left-[24px]' : 'left-[4px]'}`} />
                </div>
            </div>
            
            <p className="text-[10px] text-foregroundGrey leading-tight italic">
                Get high-quality tactical explanations. Your key is stored locally.
            </p>
        </div>
    );
}
