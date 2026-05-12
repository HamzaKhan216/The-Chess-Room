"use client"

import Link from "next/link"
import Image from "next/image"
import { useContext } from "react"
import { ConfigContext } from "@/context/config"

export default function PuzzlesMenu({ hidden }: { hidden: boolean }) {
    const configContext = useContext(ConfigContext)
    const [openedMenu, setOpenedMenu] = configContext.openedMenu

    if (hidden) return null

    return (
        <div className="flex flex-col gap-4 p-2 w-full animate-in fade-in slide-in-from-left-2 duration-200">
            <h2 className="text-foregroundGrey font-bold text-xs uppercase tracking-widest px-2">Choose Mode</h2>
            
            <Link 
                href="/puzzles" 
                onClick={() => setOpenedMenu(null)}
                className="group flex items-center justify-between bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover border-border border-[1px] rounded-borderRoundness p-4 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-backgroundBox rounded-lg">
                        <Image height={32} width={32} alt="Puzzles" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/images/puzzle.svg`} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">Puzzles</span>
                        <span className="text-foregroundGrey text-sm">Improve with curated puzzles</span>
                    </div>
                </div>
                <span className="text-foregroundGrey group-hover:text-foregroundHighlighted transition-colors font-bold">→</span>
            </Link>

            <Link 
                href="/puzzles/blitz" 
                onClick={() => setOpenedMenu(null)}
                className="group flex items-center justify-between bg-backgroundBoxBox hover:bg-backgroundBoxBoxHover border-border border-[1px] rounded-borderRoundness p-4 transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-backgroundBox rounded-lg">
                        <span className="text-3xl">⚡</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg">Puzzle Rush</span>
                        <span className="text-foregroundGrey text-sm">Race against the 60s clock</span>
                    </div>
                </div>
                <span className="text-foregroundGrey group-hover:text-foregroundHighlighted transition-colors font-bold">→</span>
            </Link>
        </div>
    )
}
