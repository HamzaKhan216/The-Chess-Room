import BestMoves from "./bestMoves";
import Moves from "./moves";
import Ratings from "./ratings";
import Themes from "./themes";
import AISettings from "./aiSettings";

export default function Settings({ hidden }: { hidden: boolean }) {
    return (
        <div className="flex flex-col gap-2" style={{ display: hidden ? 'none' : '' }}>
            <Themes />
            <Ratings />
            <AISettings />
            <Moves />
            <BestMoves />
        </div>
    )
}