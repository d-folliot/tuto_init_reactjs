import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


  // component pour une case (le board en contient 3*3)
  function Square ({addClass,onClick, value}) { //basic square.
    return (
      <button className={`square ${addClass}`} onClick={onClick} >
        {value}
      </button>
    );
  }  
  

  //component pour creer le board avec ses 9 cases.   
  function Board ({squares, onClick}) { //refait sans classes et avec 2 loops     
    const board = []; //la syntaxe jsx en fait marche avec des tableaux. 
    const win = calculateWinner(squares,true);
    for (let j = 0; j<3; j++){
      const sq = [];
      for (let i = 0 ; i<3; i++){
        let index = i+(j*3);
        sq.push(<Square value={squares[index]} 
          onClick={() => onClick(index)} 
          key={i.toString()}
          addClass={win && win.includes(index) ? 'winner':'neutral' }
          />
          );
      }
      board.push(<div className="board-row" key={j}>{sq}</div>)
    }       
    return (
      <div>{board}</div>
    );    
  }

  //séparation de la partie qui contient les infos de la partie avec boutons d'historique etc en son propre composant.
  class GameInfo extends React.Component{
    constructor (props){
      super(props);
      this.state = {isAsc : true} //ascendant /descendant pour l'ordre d'affichage des histo.
    }
    //render de la liste des boutons d'histo.
    renderMoves(){ 
        const movelist = this.props.history.map((step,move) => {
        const desc = move ?  'revenir au tour n°' : 'revenir au début de la partie';
        const mov = move? move : null;
        const last = move? step.lastMove : null;
        return (
          <li key={move}>
              <button onClick = {() =>this.props.jumpTo(move)}>{desc}<b>{mov}</b>{last}</button>
          </li>)
      });
      return this.state.isAsc? movelist : movelist.reverse();
    }

    //click sur le bouton d'ordre d'affichage
    handleClick = e =>{ // autre manière que le this.handleClick = this.handleClick.bind(this); dans le constructor
      this.setState(prevState => ({isAsc : !prevState.isAsc}));
    }

    // affichage du status de la game au dessus des boutons
    statusDisplay(curSquares){ 
      const winner = calculateWinner(curSquares);
      if (winner) return (winner + ' a gagné!');
      else if (this.props.stepNumber > 8) return ('Match nul!')
      else return ('Joueur suivant: ' + (this.props.xIsNext? 'X' : 'O'))
    }

    render(){    
      const current = this.props.history[this.props.stepNumber]; // same as handleclick       
      return ( 
        <div className="game-info">          
        <div className="status">{ this.statusDisplay(current.squares) }</div>
        Afficher <button onClick={this.handleClick}>{this.state.isAsc? 'Derniers coups en premier' : 'Par ordre chronologique'}</button>
        <ol>{this.renderMoves()}</ol>
      </div>
      );
    } 

  }

  class Game extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        history : [{squares : Array(9).fill(null), lastMove : null}],
        xIsNext: true,
        stepNumber : 0,
      };
    }
    // tâches à chaque click sur une case. 
    handleClick = i => {// autre manière que le this.handleClick= this.handleClick.bind(this); dans le constructor
      const history = this.state.history.slice(0, this.state.stepNumber +1); // tableau des different tableaux states jusqu'à la step stepnumber mais pas plus loin
      const current = history[history.length - 1]; // tableau current state
      const squares = current.squares.slice(); // copie du tableau du current state parce qu'on va le modif
      // On ne fait rien si la partie est déjà gagnée (par un clic precedent) ou si la case clic est déjà remplie
      if (calculateWinner(squares)|| squares[i]){
        return;
      } 
      // on remplit le tableau square avec le x ou o 
      squares[i] = this.state.xIsNext ?'X': 'O';
      // puis on rajoute un nouveau state contenant l'action ci dessus dans l'history. + change le  next et nombre de coups effectués.
      this.setState({history : history.concat([{squares : squares, lastMove : ' ('+ (i% 3 + 1) +','+ (Math.floor(i/3) +1) +')'}]), 
        xIsNext : !this.state.xIsNext,
        stepNumber : history.length,  
      });    
    }
    // tâches à chaque click sur un bouton de l'histo
    jumpTo = step => {// autre manière que le this.jumpTo = this.jumpTo.bind(this); dans le constructor
      this.setState({ stepNumber : step, xIsNext : (step % 2)===0})
    }

    render() {
      const {history, stepNumber, xIsNext} = this.state;      // noter la syntaxe
      const current = history[stepNumber]; // same as handleclick 
      return (
        <div className="game">
          <div className="game-board">
            <Board onClick={this.handleClick}
              squares={current.squares}/>
          </div>
          <GameInfo history={history} jumpTo={this.jumpTo} xIsNext={xIsNext} stepNumber={stepNumber} />
        </div>
      );
    }
  }

/**
 * Vérifie s'il y a un gagnant à partir de l'état actuel du board
 * @param {*} squares 
 * @returns 'X' ou 'O' si un gagnant est identifié, null sinon
 */
  function calculateWinner(squares, combiRequested) {
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
        return combiRequested? lines[i] : squares[a];
      }
    }
    return null;
  }
  // renvoi les coordonnées du dernier mouvement à partir d'un board state et du board state precedent 
  // NON UTILISE
  function calculateMove(precedent, current){
    const cur = current.squares.slice()
    const prec = precedent.squares.slice();

    for (let i = 0 ; i < 9; i++){
      if ( prec[i] !== cur[i]){
        return '('+ (i% 3 + 1) +','+ (Math.floor(i/3) +1) +')';
      }
    }
  }

  // ========================================
  
  ReactDOM.render(
    <Game />,
    document.getElementById('root')
  ); 