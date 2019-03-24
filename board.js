var board,
  game = new Chess();

/*The "AI" part starts here */

var difficulties = [];
var N = document.getElementById("AILevel").length;
for (var i = 1; i <= N; i++) {
  difficulties.push(i);
}

var selecteddiff;
chooseDifficulty();

function chooseDifficulty() {
  var select = document.getElementById("AILevel");
  selecteddiff = select.selectedIndex + 1;
  var depthform = document.getElementById("search-depth-form");
  if (selecteddiff > 2 && selecteddiff < 5) {
    depthform.style.visibility = "visible";
  } else {
    depthform.style.visibility = "hidden";
  }
  console.log(selecteddiff);
}

var positionCount;
var calculateBestMove = function(game) {
  var newGameMoves = game.ugly_moves();
  var searchdepth = parseInt(
    $("#SearchDepth")
      .find(":selected")
      .text()
  );

  switch (selecteddiff) {
    case 1:
      return RandomMove(newGameMoves);
    case 2:
      return PosEvalMove(newGameMoves);
    case 3:
    positionCount = 0;
      return MiniMaxRootMove(newGameMoves, searchdepth, game, true);
    case 4:
      break;
    default:
      alert("The Difficulty chosen is not ready yet");
  }
};

function RandomMove(MoveList) {
  return MoveList[Math.floor(Math.random() * MoveList.length)];
}

function PosEvalMove(MoveList) {
  var bestMove = null;
  //use any negative large number
  var bestValue = -9999;

  for (var i = 0; i < MoveList.length; i++) {
    var newGameMove = MoveList[i];
    game.ugly_move(newGameMove);

    //take the negative as AI plays as black
    var boardValue = -evaluateBoard(game.board());
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = newGameMove;
    }
  }

  return bestMove;
}

function MiniMaxRootMove(MoveList, depth, game, isMaximisingPlayer) {
  var bestMove = -9999;
  var bestMoveFound;

  for (var i = 0; i < MoveList.length; i++) {
    var newGameMove = MoveList[i];
    game.ugly_move(newGameMove);
    var value = MiniMax(depth - 1, game, !isMaximisingPlayer);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = newGameMove;
    }
  }
  return bestMoveFound;
}

function MiniMax(depth, game, isMaximisingPlayer) {
  positionCount++;
  if (depth === 0) {
    return -evaluateBoard(game.board());
  }

  var newGameMoves = game.ugly_moves();

  if (isMaximisingPlayer) {
    var bestMove = -9999;
    for (var i = 0; i < newGameMoves.length; i++) {
      game.ugly_move(newGameMoves[i]);
      bestMove = Math.max(
        bestMove,
        MiniMax(depth - 1, game, !isMaximisingPlayer)
      );
      game.undo();
    }
    return bestMove;
  } else {
    var bestMove = 9999;
    for (var i = 0; i < newGameMoves.length; i++) {
      game.ugly_move(newGameMoves[i]);
      bestMove = Math.min(
        bestMove,
        MiniMax(depth - 1, game, !isMaximisingPlayer)
      );
      game.undo();
    }
    return bestMove;
  }
};

var evaluateBoard = function(board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
    }
  }
  return totalEvaluation;
};

var getPieceValue = function(piece) {
  if (piece === null) {
    return 0;
  }
  var getAbsoluteValue = function(piece) {
    if (piece.type === "p") {
      return 10;
    } else if (piece.type === "r") {
      return 50;
    } else if (piece.type === "n") {
      return 30;
    } else if (piece.type === "b") {
      return 30;
    } else if (piece.type === "q") {
      return 90;
    } else if (piece.type === "k") {
      return 900;
    }
    throw "Unknown piece type: " + piece.type;
  };

  var absoluteValue = getAbsoluteValue(piece, piece.color === "w");
  return piece.color === "w" ? absoluteValue : -absoluteValue;
};

var onDragStart = function(source, piece, position, orientation) {
  if (
    game.in_checkmate() === true ||
    game.in_draw() === true ||
    piece.search(/^b/) !== -1
  ) {
    return false;
  }
};

var makeBestMove = function() {
  var bestMove = getBestMove(game);
  game.ugly_move(bestMove);
  board.position(game.fen());
  renderMoveHistory(game.history());
  if (game.game_over()) {
    alert("Game over");
  }
};

var getBestMove = function(game) {
  if (game.game_over()) {
    alert("Game over");
  }
  var bestMove = calculateBestMove(game);
  return bestMove;
};

var renderMoveHistory = function(moves) {
  var historyElement = $("#move-history").empty();
  historyElement.empty();
  for (var i = 0; i < moves.length; i = i + 2) {
    historyElement.append(
      "<span>" +
        moves[i] +
        " " +
        (moves[i + 1] ? moves[i + 1] : " ") +
        "</span><br>"
    );
  }
  historyElement.scrollTop(historyElement[0].scrollHeight);
};

var onDrop = function(source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  removeGreySquares();
  if (move === null) {
    return "snapback";
  }

  renderMoveHistory(game.history());
  window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function() {
  board.position(game.fen());
};

var onMouseoverSquare = function(square, piece) {
  var moves = game.moves({
    square: square,
    verbose: true
  });

  if (moves.length === 0) return;

  greySquare(square);

  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
};

var onMouseoutSquare = function(square, piece) {
  removeGreySquares();
};

var removeGreySquares = function() {
  $("#board .square-55d63").css("background", "");
};

var greySquare = function(square) {
  var squareEl = $("#board .square-" + square);

  var background = "#a9a9a9";
  if (squareEl.hasClass("black-3c85d") === true) {
    background = "#696969";
  }

  squareEl.css("background", background);
};

var cfg = {
  pieceTheme: "pieces/alpha/{piece}.png",
  draggable: true,
  position: "start",
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
};
board = ChessBoard("board", cfg);
