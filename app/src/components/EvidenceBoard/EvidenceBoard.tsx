import type { ForensicClue } from "../../types/forensics";
import "./EvidenceBoard.css";

interface EvidenceBoardProps {
  clues: ForensicClue[];
  activeClueId: string | null;
  onClueClick: (clue: ForensicClue) => void;
  moodTags: string[];
  eraEstimate: string;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = (props) => {
  return (
    <aside className="evidence-board-container">
      <span>Evidence {props.eraEstimate}</span>
    </aside>
  );
};
