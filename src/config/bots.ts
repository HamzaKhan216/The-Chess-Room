import { moveRating } from "@/engine/stockfish";

export interface BotPersonality {
    name: string;
    description: string;
    voiceKeyword: string;
    phrases: {
        [key in moveRating | 'generic']: {
            botMove: string[];
            playerMove: string[];
        }
    }
}

export const BOTS: BotPersonality[] = [
    {
        name: "Jimmy",
        description: "A casual player who enjoys the game.",
        voiceKeyword: "Jimmy",
        phrases: {
            blunder: {
                botMove: ["Oops! I think I messed up.", "Did I just do that? My bad."],
                playerMove: ["Oops! That looks like a blunder!", "I think you might have missed something there."]
            },
            mistake: {
                botMove: ["Ah, maybe that wasn't my best move.", "Hmm, I could have played that better."],
                playerMove: ["Careful! That might be a mistake.", "I'm not sure about that move."]
            },
            inaccuracy: {
                botMove: ["I probably could have done better there.", "Not quite perfect, but okay."],
                playerMove: ["Hmm, maybe there was a better move.", "Interesting choice, but maybe a bit slow."]
            },
            best: {
                botMove: ["Haha, I played the best move!", "Found the top choice!"],
                playerMove: ["Great move!", "Exactly what the engine wanted!"]
            },
            brilliant: {
                botMove: ["Wow, look at me go!", "I'm on fire today!"],
                playerMove: ["Wow, amazing move!", "That was brilliant!"]
            },
            great: {
                botMove: ["Wow, look at me go!", "Feeling strong!"],
                playerMove: ["Wow, amazing move!", "Great tactical vision!"]
            },
            forced: {
                botMove: ["Had no choice there.", "Only one way to go."],
                playerMove: ["Forced move.", "Nothing else you could do."]
            },
            excellent: {
                botMove: ["Solid play.", "I'm happy with that."],
                playerMove: ["Nice move!", "Excellent choice."]
            },
            good: {
                botMove: ["Not bad for a casual player!", "Moving along."],
                playerMove: ["Nice!", "Good move."]
            },
            book: {
                botMove: ["Following the theory.", "I know this opening!"],
                playerMove: ["Good opening knowledge.", "Into the books."]
            },
            miss: {
                botMove: ["I missed something there.", "Ah, a missed opportunity."],
                playerMove: ["You missed a great chance!", "I think you missed a winning line."]
            },
            generic: {
                botMove: ["Your turn!", "Let's see what you've got."],
                playerMove: ["Interesting.", "Okay, I see."]
            }
        }
    },
    {
        name: "Scarlett",
        description: "An aggressive attacker who takes no prisoners.",
        voiceKeyword: "Scarlett",
        phrases: {
            blunder: {
                botMove: ["Argh! A rare miscalculation.", "This doesn't change the outcome."],
                playerMove: ["What were you thinking?! Huge blunder!", "Is that the best you can do?"]
            },
            mistake: {
                botMove: ["Whatever, I'll still crush you.", "A minor setback."],
                playerMove: ["Terrible mistake. I will punish that.", "You're making this too easy."]
            },
            inaccuracy: {
                botMove: ["Even my inaccuracies are aggressive.", "Just a tactical nudge."],
                playerMove: ["Weak move.", "You're playing too timidly."]
            },
            best: {
                botMove: ["See? I'm unstoppable.", "Perfect execution."],
                playerMove: ["I suppose that's the best move.", "Not bad, for a target."]
            },
            brilliant: {
                botMove: ["Just try and defend against that!", "Total destruction!"],
                playerMove: ["You got lucky with that brilliant move.", "A desperate stroke of genius?"]
            },
            great: {
                botMove: ["Just try and defend against that!", "Fear the attack!"],
                playerMove: ["You got lucky with that.", "Fine, a decent move."]
            },
            forced: {
                botMove: ["The inevitable path.", "No escape."],
                playerMove: ["Trapped.", "Nowhere to run."]
            },
            excellent: {
                botMove: ["Aggressive and precise.", "The pressure builds."],
                playerMove: ["Hmph. A solid defense.", "Trying to stay alive?"]
            },
            good: {
                botMove: ["The attack continues.", "Forward!"],
                playerMove: ["Interesting...", "Keep trying."]
            },
            book: {
                botMove: ["Theory is for the weak; I follow my instincts.", "Standard destruction."],
                playerMove: ["Textbook play. Boring.", "You rely too much on books."]
            },
            miss: {
                botMove: ["A temporary oversight.", "I let you off easy... this time."],
                playerMove: ["You missed your only chance!", "That was your way out, and you blew it."]
            },
            generic: {
                botMove: ["Attack!", "No mercy."],
                playerMove: ["Pitiful.", "Try harder."]
            }
        }
    },
    {
        name: "Magnus",
        description: "The GOAT. Calm, calculated, and clinical.",
        voiceKeyword: "Magnus",
        phrases: {
            blunder: {
                botMove: ["A mouse slip in my head. Unbelievable.", "How did I miss that?"],
                playerMove: ["A complete hallucination. Blunder.", "Unbelievable. That's a huge error."]
            },
            mistake: {
                botMove: ["I'm playing too fast.", "I should have spent more time there."],
                playerMove: ["Positional mistake. You're losing your grip.", "That's not how you play this position."]
            },
            inaccuracy: {
                botMove: ["Suboptimal, but it complicates the position.", "I can do better."],
                playerMove: ["Slight inaccuracy. I'll squeeze this advantage.", "A bit imprecise."]
            },
            best: {
                botMove: ["As expected from a World Champion.", "The only move."],
                playerMove: ["The most principled continuation.", "Exactly what I would have played."]
            },
            brilliant: {
                botMove: ["Pure intuition.", "Sometimes you just feel it."],
                playerMove: ["Excellent tactical vision.", "A brilliant find."]
            },
            great: {
                botMove: ["Pure intuition.", "Clinical."],
                playerMove: ["Excellent tactical vision.", "Very strong move."]
            },
            forced: {
                botMove: ["The board dictates the move.", "Simplifying."],
                playerMove: ["The only legal response.", "Forced."]
            },
            excellent: {
                botMove: ["Principled play.", "Maintaining the tension."],
                playerMove: ["Solid play.", "Good understanding of the dynamics."]
            },
            good: {
                botMove: ["Improving my position.", "Developing."],
                playerMove: ["Solid play.", "Functional."]
            },
            book: {
                botMove: ["Opening theory is essential.", "Well-known territory."],
                playerMove: ["Excellent preparation.", "You've studied this line."]
            },
            miss: {
                botMove: ["I let the advantage slip.", "I missed a clinical finish."],
                playerMove: ["You missed the critical moment.", "There was a winning squeeze there."]
            },
            generic: {
                botMove: ["Let's see what you can do in this endgame.", "The position is interesting."],
                playerMove: ["Interesting.", "I see the idea."]
            }
        }
    }
];

export function getBotCommentary(botName: string, rating: moveRating | undefined, isBotMove: boolean, stdComment: string): string {
    const bot = BOTS.find(b => botName.includes(b.name)) || BOTS[0];
    const category = rating || 'generic';
    const phrases = bot.phrases[category] || bot.phrases['generic'];
    const list = isBotMove ? phrases.botMove : phrases.playerMove;
    const prefix = list[Math.floor(Math.random() * list.length)];
    
    return `${prefix} ${stdComment}`.trim();
}
