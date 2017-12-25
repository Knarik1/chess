function ChessBoard(figures) {

  createBoard.call(this);
  appendSquares.call(this);
  appendFigures.call(this, figures);

// listen to click events
  this.el.addEventListener('click', clickOnBoard.bind(this));

// initialize board
  function createBoard() {
    this.el = document.createElement('div');
    this.el.setAttribute('id', 'board');
    this.el.setAttribute('style', 'width: 600px; height: 600px; border: 4px solid black');
    document.getElementsByClassName('container')[0].append(this.el);
  }

// append squares to board, giving appearance as chess board
  function appendSquares() {
    var square;
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    // set one square width from dividing board to 8, get equal 8 parts
    var width = parseInt(this.el.style.width)/8 + 'px';

    // create squares, get their div elemnts and append them row by row to board
    for(var j=1; j<=8; j++) {
      var row = document.createElement('div');
      row.setAttribute('class', 'row');

      for(var k=0; k<letters.length; k++) {
          if((k+j)%2 !== 0) {
            square = new Square(letters[k] + j, this.lightColor, width);
          } else {
            square = new Square(letters[k] + j, this.darkColor, width);
          }

          document.styleSheets[0].addRule('.square-' + letters[k] + '1:before','content: "' + letters[k] + '";position: absolute; right: 7px; top: 0');
          document.styleSheets[0].addRule('.square-a' + j + ':after','content: "' + j + '";position: absolute; left: 7px; bottom: 0');

          row.appendChild(square.el);
          this.squares.push(square);
      }

       document.getElementById('board').appendChild(row);
    }
  }

// append figures to board
  function appendFigures(figures) {
    for(var i=0; i<figures.length; i++) {
        var figure = new Figure(figures[i]);
        var square = findSquareByPos.call(this, figure.position, this.squares);
        square.setFigure(figure);
        this.figures.push(figure);
    }
  }

// click callback
  function clickOnBoard(e) {
    blurOthers.call(this);
    // on fast mousemove we may loose click element, so for sure, we must check if there is clicked element
    if(findSquare(e.target, this.squares)) {
        var clickedSq = findSquare(e.target, this.squares);
        clickedSq.setClicked(true);
        if(clickedSq.hasFigure) {
            var figure = getFigure.call(this, clickedSq.pos, this.figures);
            figure.clicked = true;
            var potentialMoves = figure.getPotentialMovePoses(figure);
            setFocused.call(this, potentialMoves);
        }
    }
  }

  function setFocused(poses) {
      for(var i=0; i<poses.length; i++) {
          var sq = findSquareByPos(poses[i], this.squares);
          if(sq) {
              sq.setClicked(true);
          }
      }
  }

  function getFigure(pos, figures) {
    for(var i=0; i<figures.length; i++) {
      if(figures[i].position === pos) {
          return figures[i];
      }
    }
  }

// clear focus from others
  function blurOthers() {
    for(var sq=0; sq<this.squares.length; sq++) {
        this.squares[sq].setClicked(false);
    }
  }

// return square object if given its element
  function findSquare(el, squares) {
    for(var i=0; i<squares.length; i++) {
        if(squares[i].el === el) {
          return squares[i];
        }
    }
  }

// reurn square object if given its position
  function findSquareByPos(pos, squares) {
    for(var i=0; i<squares.length; i++) {
      if(squares[i].pos === pos) {
          return squares[i];
      }
    }
  }



}

ChessBoard.prototype = {
  lightColor: '#f0d9b5',
  darkColor: '#b58863',
  squares: [],
  figures: [],
  setStyle: function(obj) {
      for(var k in obj) {
        this.el.style[k] = obj[k];
      }
      return this;
  },
  setColors: function(light, dark) {
    this.lightColor = light;
    this.darkColor = dark;
    return this;
  },
  // setFigure: function(obj) {
  //     return this;
  // }
};

function Square (pos, color, width) {
  this.clicked = false;
  this.pos = pos;
  this.color = color;
  this.len = width;
  createSquare.call(this);

  function createSquare() {
      this.el = document.createElement('div');
      this.el.style.backgroundColor = this.color;
      this.el.style.width = this.len;
      this.el.style.height = this.len;
      this.el.setAttribute('class', 'square square-' +  this.pos);
  }
}

Square.prototype = {
    hasFigure: false,
    setClicked: function(bool) {
      if(bool) {
        if(this.hasFigure) {
            this.el.style.border = '2px solid red';
        } else {
            this.el.style.border = '2px solid #080808';
        }

        this.el.clicked = true;
      } else {
          this.el.style.border = 'none';
          this.el.clicked = false;
      }
    },
    setFigure: function(figureObj) {
      this.hasFigure = true;
      this.el.appendChild(figureObj.el);
    }
};


function Figure (paramObj) {
  this.type = paramObj.type;
  this.position = paramObj.position;
  this.color = paramObj.color;
  this.clicked = false;

  createFigure.call(this);

  function createFigure() {
      this.el = document.createElement('img');
      this.el.setAttribute('src', './images/' + this.type + '_' + this.color + '.svg');
  }
}

Figure.prototype = {
  getPotentialMovePoses: function(figure) {
    var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    var numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    var letterPos = letters.indexOf(figure.position.charAt(0));
    var numberPos = numbers.indexOf(parseInt(figure.position.charAt(1)));
    var poses = [];

    var figureMap = {
      'King': function() {
          for(var i=letterPos-1; i<=letterPos+1; i++) {
              for (var j=numberPos-1; j<=numberPos+1; j++) {
                  if(i === letterPos && j === numberPos) continue;
                  poses.push(letters[i] + numbers[j]);
              }
          }
          return poses;
      },
      'Bishop': function() {
          var diff = letterPos - numberPos;
          for(var i=0; i<letters.length; i++) {
              for (var j=0; j<numbers.length; j++) {
                  if(i === j + diff || j === -i+letterPos + numberPos) {
                      poses.push(letters[i] + numbers[j]);
                  };
              }
          }
          return poses;
      },
      'Rook': function() {
        for(var i=0; i<letters.length; i++) {
            for (var j=0; j<numbers.length; j++) {
                if(i === letterPos || j === numberPos) {
                    poses.push(letters[i] + numbers[j]);
                }
            }
        }
        return poses;
      },
    };

    getfigureMove = figureMap[figure.type];

    return getfigureMove();
  }
};

var chessBoard = new ChessBoard([
  {
    type: "King",
    position: "a2",
    color: "black"
  },
  {
      type: "Rook",
      position: "e5",
      color: "black"
  },
  {
      type: "Bishop",
      position: "c7",
      color: "white"
  }
]);
// chessBoard
//     .setColors('#f0d9b5', '#b58863')
//     .setStyle({
//       'width': '600px',
//       'height': '600px',
//       'border': '4px solid black'
//     });

