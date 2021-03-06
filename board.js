var board,
  game = new Chess();


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
}

var positionCount;
var calculateBestMove = function (game) {
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
      positionCount = 0;
      return MiniMaxABRootMove(newGameMoves, searchdepth, game, true);
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
}

function MiniMaxABRootMove(MoveList, depth, game, isMaximisingPlayer) {
  var bestMove = -9999;
  var bestMoveFound;

  for (var i = 0; i < MoveList.length; i++) {
    var newGameMove = MoveList[i];
    game.ugly_move(newGameMove);
    var value = MiniMaxAB(depth - 1, game, -10000, 10000, !isMaximisingPlayer);
    game.undo();
    if (value >= bestMove) {
      bestMove = value;
      bestMoveFound = newGameMove;
    }
  }
  return bestMoveFound;
}

function MiniMaxAB(depth, game, alpha, beta, isMaximisingPlayer) {
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
        MiniMaxAB(depth - 1, game, alpha, beta, !isMaximisingPlayer)
      );
      game.undo();
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  } else {
    var bestMove = 9999;
    for (var i = 0; i < newGameMoves.length; i++) {
      game.ugly_move(newGameMoves[i]);
      bestMove = Math.min(
        bestMove,
        MiniMaxAB(depth - 1, game, alpha, beta, !isMaximisingPlayer)
      );
      game.undo();
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        return bestMove;
      }
    }
    return bestMove;
  }
}

var evaluateBoard = function (board) {
  var totalEvaluation = 0;
  for (var i = 0; i < 8; i++) {
    for (var j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
    }
  }
  return totalEvaluation;
};

var getPieceValue = function (piece) {
  if (piece === null) {
    return 0;
  }
  var getAbsoluteValue = function (piece) {
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

var onDragStart = function (source, piece, position, orientation) {
  if (
    game.in_checkmate() === true ||
    game.in_draw() === true ||
    piece.search(/^b/) !== -1
  ) {
    return false;
  }
};

var makeBestMove = function () {
  var bestMove = getBestMove(game);
  if(bestMove){
    game.ugly_move(bestMove);
    board.position(game.fen());
  }
  renderMoveHistory(game.history({ verbose: true }));
  if (game.game_over()) {
    ManageGameOver(game);
  }
};

var getBestMove = function (game) {
  if (game.game_over()) {
    ManageGameOver(game);
    return 0;
  } else {
    //$('#thinking-modal-message')[0].innerHTML = "Thinking";
    //$('#ThinkingModel').modal('show');
    var d = new Date().getTime();
    var bestMove = calculateBestMove(game);
    d = new Date().getTime() - d;
    //$('#ThinkingModel').modal('hide');
    document.getElementById("last-time").innerHTML =
      "Last adversary move took <strong>" + d / 1000 + "s </strong>";
    return bestMove;
  }
};

function renderMoveHistory(verbosemoves,state) {
  var historyElement = $("#move-history");
  historyElement.empty();
  if (verbosemoves) {
    for (var i = 0; i < verbosemoves.length; i++) {
      let path = "pieces/alpha/"+verbosemoves[i].color+verbosemoves[i].piece.toUpperCase()+".png";
      historyElement.append("<span class='alert alert-light float-"
      +(verbosemoves[i].color=="w"?"right mr-2":"left")+"'>"+ 
      "<img src='"+path+"' width='24' /> <strong>"+verbosemoves[i].from+"</strong> -> <strong>"
      +verbosemoves[i].to
      +"</strong></span><br>");
    }
  }

  if(state){
    let color = (state=="w"?"success":(state=="l"?"danger":"warning"))
    let side = (state=="w"?"right":"left")
    console.log(historyElement)
  historyElement.append("<span class='alert alert-"+color+" float-"+side+"'><strong>"
  +(state=="w"?"You win!":(state=="l"?"You lose!":"It's a draw !"))
  +"</strong></span><br>");
  
  console.log(historyElement)
  }
  
  historyElement.scrollTop(historyElement[0].scrollHeight);
};

function ManageGameOver(game){
  let messageTitle, messageContent,state;
  if(game.in_checkmate()){
    messageTitle = "Checkmate";
    if(game.turn()=="w"){
      state = "l";
      messageContent = "You lose";
    }else{
      state = "w";
      messageContent = "You win";
    }
  }else if(game.in_threefold_repetition()){
    state = "d";
    messageTitle = "It's a draw";
    messageContent = "Threefold Repetition";
  }else if(game.in_stalemate()){
    state = "d";
    messageTitle = "It's a draw";
    messageContent = "Stalemate";
  }else if(game.in_draw()){
    state = "d";
    messageTitle = "It's a draw";
    messageContent = "";
  }else{
    alert("Game over");
  }
  renderMoveHistory(game.history({ verbose: true }),state);

  $('#modal-title')[0].innerHTML = messageTitle;
  $('#modal-message')[0].innerHTML = messageContent;
  $('#GameOverModel').modal('toggle');


}

var onDrop = function (source, target) {
  var move = game.move({
    from: source,
    to: target,
    promotion: "q"
  });

  removeGreySquares();
  renderMoveHistory(game.history({ verbose: true }));
  if (move === null) {
    return "snapback";
  }

  window.setTimeout(makeBestMove, 250);
};

var onSnapEnd = function () {
  board.position(game.fen());
};

var onMouseoverSquare = function (square, piece) {
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

var onMouseoutSquare = function (square, piece) {
  removeGreySquares();
};

var removeGreySquares = function () {
  $("#board .square-55d63").css("background", "");
};

var greySquare = function (square) {
  var squareEl = $("#board .square-" + square);

  var background = "#19c2d3";
  if (squareEl.hasClass("black-3c85d") === true) {
    background = "#18818b";
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

$('#resetbtn').on('click', board.start);

document.getElementById("resetbtn").addEventListener("click", function () {
  game = new Chess();
  $("#move-history").empty();
});
