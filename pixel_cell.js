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

    return <ul>{listCells}</ul>;
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

const domContainer = document.querySelector('#palette');
ReactDOM.render(<Palette availableColors={paletteColors} selectedColor="#00FF00"/>, domContainer);


var canvas = document.getElementById('canvas');
    

if (canvas.getContext) {
  var ctx = canvas.getContext('2d');

  canvas.addEventListener("click", drawPixel);
}

var pixelWidth = 10;
var pixelHeight = 10;

function drawPixel(event) {
  let pixelX = Math.floor(event.offsetX / pixelWidth) * pixelWidth;
  let pixelY = Math.floor(event.offsetY / pixelHeight) * pixelHeight;
  ctx.fillStyle = getCurrentColor();
  ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
}