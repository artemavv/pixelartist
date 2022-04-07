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
  }

  render() {
    const listCells = this.props.availableColors.map((color) =>
      <li key={color.toString()}>
        <PaletteCell color={color} selected={false} />
      </li>);

    return <ul>{listCells}</ul>;
  }
}

class PaletteCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selected: props.selected } ;
  }

  render() {
    
    const cellStyle = { 
      backgroundColor: this.props.color
    };

    if (this.state.selected) {
      console.log(getCurrentColor());
      

      return <div 
        className="px-palette-cell cell-selected" 
        style={cellStyle} 
        onClick={() => this.setState({ selected: ! this.state.selected })}></div>
    }
    else {
        return <div 
        className="px-palette-cell cell-not-selected" 
        style={cellStyle} 
        onClick={() => {
          setCurrentColor(this.props.color);
          this.setState({ selected: ! this.state.selected });
        }}></div>
    }
  }
}


const domContainer = document.querySelector('#palette');
ReactDOM.render(<Palette availableColors={["#00FF00", "#0000FF", "#FF0000"]}/>, domContainer);


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