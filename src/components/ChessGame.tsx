import React, { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

interface ChessGameProps {
  moves: string[];
  onMoveUpdate: (moves: string[], inCheck: boolean) => void;
  onTurnChange?: (isWhiteTurn: boolean) => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ moves, onMoveUpdate, onTurnChange }) => {
  const gameRef = useRef(new Chess());
  const [fen, setFen] = useState("start");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(400);

// This code monitors the moves array and checks if the game still has a history. 
// If the game has movement history, upon clicking "reset" it will update the FEN.
  useEffect(() => {
    if (moves.length === 0 && gameRef.current.history().length > 0) {
      gameRef.current.reset();
      setFen(gameRef.current.fen());
    }
  }, [moves]);
   
// Wrapper resize for mobile !
  useEffect(() => {
    if (!wrapperRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (let entry of entries) {
        setBoardWidth(entry.contentRect.width);
      }
    });
    ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

 /////////

// This code allows the chess game to operate and "mutate" from the chess.js library without breaking. 
// This code was modified a few times because of crashing that was occuring upon moving the opposite side pieces.

 const safeGameMutate = (modify: (g: Chess) => void) => {
  const game = gameRef.current;
  modify(game);
  setFen(game.fen());

  const isInCheck = game.inCheck();
  onMoveUpdate(game.history(), isInCheck);

  const isWhiteTurnNow = game.turn() === "w";
  onTurnChange?.(isWhiteTurnNow);
};
  // This is the move history updating in real time! (Line 34)
 // This code also pushes a message to the player if the king is in check. (Line 34)

  ///////////

  const onDrop = (source: string, target: string): boolean => {
    let move = null;

    safeGameMutate((g) => {
      move = g.move({
        from: source,
        to: target,
        promotion: "q",
      });
    });

    return move !== null;
  };

  return (
    <div ref={wrapperRef} className="chess-area">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardWidth={boardWidth}
      />
    </div>
  );
};

export default ChessGame;