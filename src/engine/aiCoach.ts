import { move } from "./stockfish";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent";

export interface AIExplanationRequest {
    moveIndex: number;
    san: string;
    rating: string;
    evalBefore: string;
    evalAfter: string;
    bestMove?: string;
    fen: string;
    playedBy?: string;
    capturedPiece?: string;
}

export async function getAIExplanations(apiKey: string, moves: AIExplanationRequest[], provider: "groq" | "gemini" = "groq", aiMode: "beginner" | "advanced" = "advanced", botPersonality?: string): Promise<Record<number, string>> {
    if (!apiKey) throw new Error(`${provider} API Key is missing`);

    const advancedPrompt = `You are a Grandmaster Chess Coach. You will be provided with a list of key moments from a chess game. 
Each item contains data about the move: the move played ('san'), the engine evaluation before and after, the 'bestMove' that should have been played, the piece captured ('capturedPiece'), and who played it ('playedBy').
For each move, provide a concise (1-2 sentences), insightful, and encouraging explanation of why the move was good or bad.
If the move was a mistake, inaccuracy, or blunder, you MUST mention the 'bestMove' provided in the data as the better alternative. Do NOT invent, guess, or hallucinate chess moves. ONLY suggest the exact 'bestMove' from the data.
Focus on tactical patterns like forks, pins, skewers, hanging pieces, or strategic goals.
Use a friendly, professional tone. If playedBy is "User", address the user directly (e.g. "You played...", "Your move..."). If playedBy is "Opponent", refer to them as your opponent (e.g. "Your opponent played...", "They...").
IMPORTANT: Analyze each move strictly in isolation. Do NOT reference future moves or comment on whether the other player took advantage of it, because the other player hasn't moved yet at that moment in time.
IMPORTANT: Do NOT use phrases like "the engine suggests", "the data shows", or "in line with the best move". Phrase your explanation naturally, as if you are a real human analyzing the board yourself. For example, say "A better alternative would have been X" instead of "The suggested best move is X".
Return your response as a FLAT JSON object where the keys are the move indices (as strings) and the values are the explanations. Do not wrap the response in any other object.`;

    const beginnerPrompt = `You are a friendly Chess Teacher for absolute beginners. You will be provided with a list of key moments from a chess game. 
Each item contains data about the move: the move played ('san'), the engine evaluation before and after, the 'bestMove' that should have been played, the piece captured ('capturedPiece'), and who played it ('playedBy').
For each move, provide a VERY simple, 1-sentence explanation of what happened. 
If the move was a mistake, inaccuracy, or blunder, you MUST mention the 'bestMove' provided in the data as the better alternative. Do NOT invent or guess better moves. ONLY suggest the exact 'bestMove' from the data.
AVOID technical jargon like "fork", "pin", "skewer", "eval", or "tempo" unless you explain it very simply.
Instead of saying "X is a miss as it allows Y", say something like "You missed a chance to take a free piece" or "You forgot to protect your Queen!".
Focus on the basic result: "You lost your Rook here", "This move captures a free Pawn", "Your King is now safe".
If playedBy is "User", address the user directly. If playedBy is "Opponent", refer to them as your opponent.
IMPORTANT: Analyze each move strictly in isolation. Do NOT reference future moves or comment on whether the other player took advantage of it, because the other player hasn't moved yet at that moment in time.
IMPORTANT: Do NOT use phrases like "the engine suggests", "the data shows", or "in line with the best move". Phrase your explanation naturally, as if you are a real human analyzing the board yourself. For example, say "A better alternative would have been X" instead of "The suggested best move is X".
IMPORTANT: NEVER use algebraic chess notation (like "Nxd4", "Bh3", "Qe2", etc). Always translate moves into plain English for an absolute beginner (e.g., "moving your Knight", "capturing their Bishop", "moving the Queen to a safer square"). Even when suggesting the 'bestMove', do NOT say "you should have played Nbc3", instead say "you should have moved your other Knight".
Return your response as a FLAT JSON object where the keys are the move indices (as strings) and the values are the explanations. Do not wrap the response in any other object.`;

    const botPrompt = `You are a Chess Bot with a specific personality: "${botPersonality}". 
Provide a short, 1-sentence comment on the current move. 
If the user made a mistake, you can be slightly cheeky or encouraging depending on your personality.
If you made a move, explain why you did it in character.
Return your response as a FLAT JSON object where the keys are the move indices (as strings) and the values are the explanations.`;

    const systemPrompt = botPersonality ? botPrompt : (aiMode === "beginner" ? beginnerPrompt : advancedPrompt);
    const userPrompt = JSON.stringify(moves);

    if (provider === "groq") {
        try {
            const response = await fetch(GROQ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", 
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 0.1,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Groq request failed");
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            const cleaned = content.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error("Groq Error:", error);
            throw error;
        }
    } else {
        // Gemini Logic
        try {
            const url = `${GEMINI_API_URL}?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: systemPrompt + "\n\n" + userPrompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: "application/json"
                    }
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Gemini request failed");
            }

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error("Gemini Error:", error);
            throw error;
        }
    }
}
