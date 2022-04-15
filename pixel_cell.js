'use strict';

const e = React.createElement;
var globalColor = '#000000';

var getCurrentColor = function() {
    return globalColor;
}

var setCurrentColor = function( color ) {
    globalColor = color;
}


class Palette extends React.Component {
  constructor(props) {
    super(props);
    this.changeSelectedColor = this.changeSelectedColor.bind(this);
    this.state = { selectedColor: props.selectedColor };
    setCurrentColor( props.selectedColor );
  }

  changeSelectedColor( newColor ) {
    console.log('New color:' + newColor);
    this.setState({selectedColor: newColor});
    setCurrentColor(newColor);
  }

  render() {
    console.log('render palette with this.state.selectedColor = ' + this.state.selectedColor);
    const listCells = this.props.availableColors.map((color) =>
      <li key={color.toString()}>
        <PaletteCell color={color} selected={ this.state.selectedColor == color } actionWhenClicked={this.changeSelectedColor}/>
      </li>);

    return <div id="palette"><ul>{listCells}</ul></div>;
  }
}

class PaletteCell extends React.Component {
  constructor(props) {
    super(props);
    this.clicked = this.clicked.bind(this);
  }

  clicked() {
    this.props.actionWhenClicked(this.props.color);
  }

  render() {
    const cellStyle = { backgroundColor: this.props.color };
    const cellClasses = this.props.selected ? "px-palette-cell cell-selected" : "px-palette-cell cell-not-selected";

    return <div className={cellClasses} style={cellStyle} onClick={this.clicked}></div>
  }
}

var ctx; //global variable for canvas context

const paletteColors = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#BBBBBB",
  "#FFFFFF",
  "#aa33ee",
  "#00FF00",
  "#0000FF",
  "#FF0000"
];


class Board extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = { 
      boardPxHeight: props.height * props.pixelHeight,
      boardPxWidth: props.width * props.pixelWidth 
    };

    this.cellColors = this.initCellColors(this.props.height, this.props.width);

    this.handleClick = this.handleClick.bind(this);
    this.setCellColor = this.setCellColor.bind(this);
    this.drawCell = this.drawCell.bind(this);
    this.drawBoardCells = this.drawBoardCells.bind(this);
    this.setRandomBorders = this.setRandomBorders.bind(this);
    this.drawBoardBorders = this.drawBoardBorders.bind(this);
    this.isInsideBorder = this.isInsideBorder.bind(this);
    
  }

  componentDidMount() {
    var canvas = document.getElementById('canvas');
        

    if (canvas.getContext) {
      ctx = canvas.getContext('2d');

      canvas.addEventListener("click", this.handleClick);
    }

    this.setRandomBorders();
    this.drawBoardCells();
    this.drawBoardBorders();
  }

  handleClick(event) {
    let cellX = Math.floor(event.offsetX / this.props.pixelWidth);
    let cellY = Math.floor(event.offsetY / this.props.pixelHeight);

    if ( this.isInsideBorder(cellX, cellY) ) {
      this.setCellColor(cellX, cellY, getCurrentColor())
      this.drawBoardCells();
      this.drawBoardBorders();
    }
  }

  initCellColors( height, width ) {
    let cellColors = new Array(width);

    for (let x = 0; x < width; x++) {
      cellColors[x] = new Array(height);

      for( let y = 0; y < height; y++) {
        cellColors[x][y] = '#ffffff';
      }
    }
    return cellColors;
  }

  setCellColor(x,y,color) {
    this.cellColors[x][y] = color;
  }

  drawCell(x,y,color) {
    let pixelX = x * this.props.pixelWidth;
    let pixelY = y * this.props.pixelHeight;

    if (!color) {
      ctx.fillStyle = '#ffffff';
    }
    else {
      ctx.fillStyle = color;
    }

    ctx.fillRect(pixelX, pixelY, this.props.pixelWidth, this.props.pixelHeight);
  }

  drawBoardCells() {
    for (let x = 0; x < this.props.width; x++) {
      for( let y = 0; y < this.props.height; y++) {
        this.drawCell(x,y,this.cellColors[x][y])
      }
    }
  }

  setRandomBorders() {

    let X1 = 0, Y1 = 0, X2 = 0, Y2 = 0;

    let i = 0;
    while ( X1 == Y2 || Y1 == Y2 ) { // make sure all coords are different
      // define two sets of coordinates
      X1 = Math.floor(Math.random() * this.props.width);
      Y1 = Math.floor(Math.random() * this.props.height);
      X2 = Math.floor(Math.random() * this.props.width);
      Y2 = Math.floor(Math.random() * this.props.height);

      console.log(X1,Y1,X2,Y2);

      if (i++ > 100 ) break;
    }
    
    // choose coords for top left corner
    let Xs = X1 > X2 ? X2 : X1;
    let Ys = Y1 > Y2 ? Y2 : Y1;

    // choose coords for bottom right corner
    let Xe = X1 > X2 ? X1 : X2;
    let Ye = Y1 > Y2 ? Y1 : Y2;

     
    const topCorner = [Xs,Ys];
    const bottomCorner = [Xe,Ye];
      
    this.state.borders = [topCorner, bottomCorner];
    console.log('border', [topCorner, bottomCorner]);
  }

  isInsideBorder( cellX, cellY) {
    const isInsideHorizontally = (this.state.borders[0][0] <= cellX) && (cellX < this.state.borders[1][0]);
    const isInsideVertically = (this.state.borders[0][1] <= cellY) && (cellY < this.state.borders[1][1]);

    return isInsideHorizontally && isInsideVertically;
  }

  drawBoardBorders() {
    ctx.fillStyle = '#44eaed';

    console.log(this.state);
    
    const borderTopX = this.state.borders[0][0] * this.props.pixelWidth;
    const borderTopY = this.state.borders[0][1] * this.props.pixelHeight;

    const borderWidth = this.state.borders[1][0] * this.props.pixelWidth - borderTopX;
    const borderHeight = this.state.borders[1][1] * this.props.pixelHeight - borderTopY;

    ctx.strokeStyle = '#44eaed';
    ctx.strokeRect(borderTopX, borderTopY, borderWidth, borderHeight);
  }

  render() {
    const boardStyle = { border: "1px solid black" };
    return <canvas id="canvas" height={this.state.boardPxHeight} width={this.state.boardPxWidth} style={boardStyle} ></canvas>
  }
}

const domContainer = document.querySelector('#board');
ReactDOM.render(
  <div><Board height="30" width="30" pixelHeight="10" pixelWidth="10" ></Board>
  <Palette availableColors={paletteColors} selectedColor="#00FF00"/></div>, 
  domContainer);

