// src/components/ChessGame.tsx
import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface ChessGameProps {
  moves: string[];
  onMoveUpdate: (moves: string[], inCheck: boolean) => void;
  onTurnChange?: (isWhiteTurn: boolean) => void;
}

const ChessGame: React.FC<ChessGameProps> = ({
  moves,
  onMoveUpdate,
  onTurnChange,
}) => {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState("start");

  // reset FEN when history cleared
  useEffect(() => {
    if (moves.length === 0 && gameRef.current.history().length > 0) {
      gameRef.current.reset();
      setFen(gameRef.current.fen());
    }
  }, [moves]);

  // mutate & update move history / check status
  const safeGameMutate = (modify: (g: Chess) => void) => {
    const game = gameRef.current;
    modify(game);
    setFen(game.fen());

    const inCheck = game.inCheck();
    onMoveUpdate(game.history(), inCheck);

    const whiteToMove = game.turn() === "w";
    onTurnChange?.(whiteToMove);
  };

  const onDrop = (source: string, target: string): boolean => {
    let move = null;
    safeGameMutate((g) => {
      move = g.move({ from: source, to: target, promotion: "q" });
    });
    return move !== null;
  };

  return (
    <div className="chess-area">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
      />
    </div>
  );
};

export default ChessGame;
