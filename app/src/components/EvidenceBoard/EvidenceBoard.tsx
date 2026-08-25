import React from "react";
import { ForensicClue } from "../../types/forensics";
import "./EvidenceBoard.css";

interface EvidenceBoardProps {
  clues: ForensicClue[];
  activeClueId: string | null;
  onClueClick: (clue: ForensicClue) => void;
  moodTags: string[];
  eraEstimate: string;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = () => {
  return (
    <aside className="evidence-board-container">
      {/* Evidence tags, timeline checkpoints, and forensic notes */}
    </aside>
  );
};
