import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={"square h-1/3 border -mr-px -mt-px border-blue-300 rounded-lg text-2xl text-center" + (props.highlight ? " text-blue-300" : "")} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, highlight = false) {
    return (
      <Square
        highlight={highlight}
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    // 5. When someone wins, highlight the three squares that caused the win
    let coordsOfWin;
    if (this.props.winner) {
      coordsOfWin = findWinningPosition(this.props.squares);
    }
    
    // 3. Rewrite Board to use two loops to make the squares
    let board = [];
    for (let j = 0; j < 3; j++) {
      let row = [];
      for (let i = 0; i < 3; i++) {
        const squareCoords = 3 * j + i;
        row.push(
          this.renderSquare(squareCoords, coordsOfWin && coordsOfWin.includes(squareCoords))
        );
      }
      board.push(<div className="board-row flex-1 flex flex-col h-32" key={j}>{row}</div>);
    }


    return (
      <div className="flex w-full h-full">
        {board}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      reverse: false,
      draw: false,
    }
  }

  // Updates the state of class containing squares and xIsNext
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      reverse: this.state.reverse,

    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  reverseSteps() {
    this.setState({
      reverse: !this.state.reverse,
    });
  }


  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    let moves = history.map((step, move, arr) => {
      let coords;
      let desc;
      if (move) {
        coords = compBoardStates(arr[move].squares, arr[move - 1].squares);
        // 1. Display the location for each move
        desc = 'Go to move #' + move + ' (' + coords[0] + ',' + coords[1] + ')';
      } else {
        desc = 'Go to game start';
      }

      return (
        <li key={move}>
          {/* 2. Bold, in this case underline, the currently selected item */}
          <button className={move === this.state.stepNumber ? "underline" : ""} onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });
    
    // 6. When no one wins, display a message about the result being a draw
    let draw = false;
    if (!winner && this.state.stepNumber >= 9) {
      draw = true;
    }

    // 4. Add a toggle button that lets you sort the moves in either ascending or descending order
    if (this.state.reverse) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game flex flex-row p-6 max-w-md mx-auto min-h-screen items-center">
        {/* Board */}
        <div className="h-32 mr-8">
          <div className="game-board flex flex-col h-full w-32">
            <Board
              winner={winner ? true : false}
              squares={current.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          {draw && <p className="text-center pt-2 text-blue-300">Draw</p>}
        </div>
        {/* Steps/Moves section */}
        <div className="game-info flex-1">
          <div className="flex justify-between pb-3 items-center h-12">
            <div className="">{status}</div>
            <button 
              className={"bg-blue-300 rounded-md px-2 py-1" + (this.state.reverse ?'text-blue-300' : 'text-red-500')} 
              onClick={() => {this.reverseSteps()}}>Reverse</button>
          </div>
          <ol className="bg-yellow-300 rounded-lg px-3 py-1">{moves}</ol>
        </div>
      </div>
    );
  }
}


ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function findWinningPosition(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
}

// Takes two arrays of numbers and returns the 2D coordinates of the
// first tile that is different.
function compBoardStates(current, previous) {
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 3; x++) {
      let i = 3 * (y - 1) + x - 1;
      if (current[i] !== previous[i]) {
        return [x, y];
      }
    }
  }
  // Should never be reached
  return [100,100];
}