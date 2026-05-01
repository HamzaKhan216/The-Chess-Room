"use client"

import { useContext, useState } from "react"
import { AnalyzeContext } from "@/context/analyze"
import Image from "next/image"

const BOTS = [
    {
        id: "friendly",
        name: "Jimmy (Casual)",
        description: "A friendly learner who makes occasional mistakes. Great for practice!",
        difficulty: 5,
        avatar: "/images/bots/casual.png",
        personality: "encouraging and simple"
    },
    {
        id: "aggressive",
        name: "Scarlett (Aggressive)",
        description: "Loves tactical sacrifices and wild attacks. Watch your King!",
        difficulty: 12,
        avatar: "/images/bots/aggressive.png",
        personality: "bold and tactical"
    },
    {
        id: "grandmaster",
        name: "Magnus Bot (GM)",
        description: "Plays like a legend. Expect a tough challenge and some trash talk.",
        difficulty: 20,
        avatar: "/images/bots/GM.png",
        personality: "competitive and elite"
    }
]

export default function PlayBots() {
    const { 
        pageState: [, setPageState],
        botDifficulty: [, setBotDifficulty],
        game: [, setGame],
        moveNumber: [, setMoveNumber],
        players: [, setPlayers],
        tab: [, setTab]
    } = useContext(AnalyzeContext)

    const [userElo, setUserElo] = useState("1500")

    function selectBot(bot: typeof BOTS[0]) {
        setBotDifficulty(bot.difficulty)
        setPlayers([{ name: "You", elo: userElo || "1500" }, { name: bot.name, elo: (bot.difficulty * 150).toString() }])
        
        // Initialize game with starting position
        setGame([{
            fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            color: 'w',
            previousStaticEvals: [["cp", "15"]]
        }])
        setMoveNumber(0)
        setPageState('playBots')
        setTab('moves') // Go to moves tab to play
    }

    return (
        <div className="flex flex-col gap-6 p-6 h-full bg-backgroundBox">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Choose Your Opponent</h2>
                <p className="text-foregroundGrey text-sm">Select a bot to start a new game.</p>
            </div>

            <div className="flex flex-row items-center gap-4 bg-backgroundBoxBoxDisabled p-4 rounded-borderRoundness border border-neutral-800">
                <span className="text-white font-bold text-sm">Your ELO:</span>
                <input 
                    type="number" 
                    value={userElo} 
                    onChange={(e) => setUserElo(e.target.value)}
                    className="bg-neutral-800 text-white px-3 py-1.5 rounded outline-none border border-neutral-700 focus:border-highlightBrilliant w-24 text-sm"
                    placeholder="1500"
                />
            </div>

            <div className="flex flex-col gap-4">
                {BOTS.map((bot) => (
                    <button
                        key={bot.id}
                        onClick={() => selectBot(bot)}
                        className="group flex flex-row items-center gap-4 p-4 rounded-borderRoundness bg-backgroundBoxBoxDisabled border border-neutral-800 hover:border-highlightBrilliant transition-all text-left shadow-lg hover:shadow-highlightBrilliant/10"
                    >
                        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-neutral-700 group-hover:border-highlightBrilliant transition-colors flex-shrink-0">
                            <img src={bot.avatar} alt={bot.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col gap-1 flex-grow">
                            <div className="flex flex-row justify-between items-center">
                                <span className="font-bold text-white group-hover:text-highlightBrilliant transition-colors">{bot.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-foregroundGrey font-bold uppercase tracking-wider">Lvl {bot.difficulty}</span>
                            </div>
                            <p className="text-xs text-foregroundGrey leading-relaxed">{bot.description}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-auto p-4 rounded-lg bg-highlightBrilliant/5 border border-highlightBrilliant/20 italic text-xs text-center text-foregroundGrey">
                "The AI Coach will provide live feedback based on the bot's personality!"
            </div>
        </div>
    )
}
