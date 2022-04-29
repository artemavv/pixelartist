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




class boardRectangle {
	constructor(Xs,Ys,Xe,Ye) {
    this.topCornerX = Xs;
		this.topCornerY = Ys;
		this.bottomCornerX = Xe;
		this.bottomCornerY = Ye;
	}
	
	calcArea() {
		return  Math.abs((this.bottomCornerY - this.topCornerY) * (this.topCornerX - this.bottomCornerX));
	}
}

class boardCell {
	constructor(x,y) {
    this.x = x;
    this.y = y;
		
		this.color = '#ffffff';
		
		this.writable = false;
		
		this.topBorder = false;
		this.rightBorder = false;
		this.bottomBorder = false;
		this.leftBorder = false;
  }
}

class boardState {
	constructor(width, height) {
    this.width = width;
    this.height = height;
		this.cells = new Array(width);
		
		for (let x = 0; x < width; x++) {
      this.cells[x] = new Array(height);
      for( let y = 0; y < height; y++) {
				this.cells[x][y] = new boardCell(x,y); // white non-writable cell, no borders
			}
		}
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
		
		this.boardState = new boardState(props.width, props.height);

    this.handleClick = this.handleClick.bind(this);
    
		this.setCellColor = this.setCellColor.bind(this);
		this.setCellWritable = this.setCellWritable.bind(this);
		this.isCellWritable = this.isCellWritable.bind(this);
		this.setWritableState = this.setWritableState.bind(this);
		this.calculateRegionExtended = this.calculateRegionExtended.bind(this);
		this.calcRegionArea = this.calcRegionArea.bind(this);
		this.calcWritableBorders = this.calcWritableBorders.bind(this);
		
		
    this.drawCell = this.drawCell.bind(this);
    this.drawBoardCells = this.drawBoardCells.bind(this);
    this.setRandomBorders = this.setRandomBorders.bind(this);
    this.drawBoardBorders = this.drawBoardBorders.bind(this);
    //this.isInsideBorder = this.isInsideBorder.bind(this);
    
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

    if ( this.isCellWritable(cellX, cellY) ) {
      this.setCellColor(cellX, cellY, getCurrentColor());
      this.drawBoardCells();
      this.drawBoardBorders();
    }
  }

  setCellColor(x,y,color) {
    this.boardState.cells[x][y].color = color;
  }
	
  setCellWritable(x,y,writable) {
    this.boardState.cells[x][y].writable = writable;
  }
	
	isCellWritable(x,y) {
    return this.boardState.cells[x][y].writable;
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
        this.drawCell(x,y,this.boardState.cells[x][y].color);
      }
    }
  }


	setRandomBorders() {
		
		let writableArea = 0;
		const maxWritableArea = 300;
		
		while ( writableArea < maxWritableArea ) {
			let rect = this.prepareRectangle(150);
			let boardRegion = this.calculateRegionExtended(rect);
			this.setWritableState(boardRegion);
			writableArea = this.calcRegionArea(boardRegion);
		}
		this.calcWritableBorders();
	}
	
	setWritableState(newState) {
		if (newState !== false) {
			for (let x = 0; x < this.props.width; x++) {
				for( let y = 0; y < this.props.height; y++) {
					this.setCellWritable(x,y,newState[x][y]);
					this.setCellColor(x,y,newState[x][y] ? '#eeeeee' : '#ffffff');
				}
			}		
		}
	}
	
	calcWritableBorders() {
		for (let x = 0; x < this.props.width; x++) {
			for( let y = 0; y < this.props.height; y++) {
				
				const currentCell = this.boardState.cells[x][y];
				
				if ( y > 0 ) {
					const adjacentTopCell = this.boardState.cells[x][y-1];
					if ( currentCell.writable && !adjacentTopCell.writable ) {
						this.boardState.cells[x][y].topBorder = true;
					}
				}
				
				if ( x > 0 ) {
					const adjacentLeftCell = this.boardState.cells[x-1][y];
					if ( currentCell.writable && !adjacentLeftCell.writable ) {
						this.boardState.cells[x][y].leftBorder = true;
					}
				}
				
				if ( x < this.props.width - 1 ) {
					const adjacentRightCell = this.boardState.cells[x+1][y];
					if ( currentCell.writable && !adjacentRightCell.writable ) {
						this.boardState.cells[x][y].rightBorder = true;
					}
				}
				
				if ( y < this.props.width - 1 ) {
					const adjacentBottomCell = this.boardState.cells[x][y+1];
					if ( currentCell.writable && !adjacentBottomCell.writable ) {
						this.boardState.cells[x][y].bottomBorder = true;
					}
				}
					
			}
		}
	}
	
  prepareRectangle( maxArea ) {

		let rectArea = maxArea + 1;
		
		while (rectArea > maxArea ) {
			var rect = this.generateRandomRectangle();
			if ( rect !== false ) {
				rectArea = rect.calcArea();
			}
		} 
   
		//console.log('newWritableRegion', newWritableRegion);
		//console.log('rectArea', rectArea);
    return rect;
  }
	
	calculateRegionExtended ( rectangle ) {
		
		var newRegion = new Array(this.props.width);
		
		for (let x = 0; x < this.props.width; x++) {
			newRegion[x] = new Array(this.props.height);
			for( let y = 0; y < this.props.height; y++) {
				newRegion[x][y] = this.isCellWritable(x,y);
				
				if ( this.isInsideRectangle(x,y,rectangle) ) {
					newRegion[x][y] = true;
				}
			}
		}		
		
		return newRegion;
	}
	
	calcRegionArea( region ) {
		let area = 0;
		for (let x = 0; x < this.props.width; x++) {
			for( let y = 0; y < this.props.height; y++) {
				if (region[x][y]) {
					area++;
				}
			}
		}	
		return area;
	}
	
	generateRandomRectangle() {
		
		let i = 0;
		let X1 = 0, Y1 = 0, X2 = 0, Y2 = 0;
		
		// define two sets of coordinates
		while ( X1 === Y2 || Y1 === Y2 ) { // make sure all coords are different
			X1 = Math.floor(Math.random() * this.props.width);
			Y1 = Math.floor(Math.random() * this.props.height);
			X2 = Math.floor(Math.random() * this.props.width);
			Y2 = Y1 + (X2 - X1); //Math.floor(Math.random() * this.props.height);
			
			// choose coords for top left corner
			let Xs = X1 > X2 ? X2 : X1;
			let Ys = Y1 > Y2 ? Y2 : Y1;

			// choose coords for bottom right corner
			let Xe = X1 > X2 ? X1 : X2;
			let Ye = Y1 > Y2 ? Y1 : Y2;
			
			var rect = new boardRectangle(Xs,Ys,Xe,Ye);
      if ( i++ > 100 ) return false;
    }

    //console.log('generateRandomRectangle', rect);
		return rect;
	}

  isInsideRectangle( x, y, rectangle) {
    const isInsideHorizontally = (rectangle.topCornerX <= x) && (x < rectangle.bottomCornerX);
    const isInsideVertically = (rectangle.topCornerY <= y) && (y < rectangle.bottomCornerY);

    return isInsideHorizontally && isInsideVertically;
  }

  drawBoardBorders() {
		
		ctx.strokeStyle = '#44eaed';
		
		for (let x = 0; x < this.props.width; x++) {
			for( let y = 0; y < this.props.height; y++) {
				
				const currentCell = this.boardState.cells[x][y];
				
				if ( currentCell.topBorder ) {
					
					let startX = x * this.props.pixelWidth;
					let endX = startX + (+this.props.pixelWidth);
					
					let startY = y * this.props.pixelHeight;
					let endY = startY;
					
					ctx.beginPath();
					ctx.moveTo( startX, startY );
					ctx.lineTo( endX, endY );
					ctx.stroke();
					ctx.closePath();
				}
				
				if ( currentCell.leftBorder ) {
					
					let startX = x * this.props.pixelWidth;
					let endX = startX;
					
					let startY = y * this.props.pixelHeight;
					let endY = startY + (+this.props.pixelHeight);
					
					ctx.beginPath();
					ctx.moveTo( startX, startY );
					ctx.lineTo( endX, endY );
					ctx.stroke();
					ctx.closePath();
				}
				
				if ( currentCell.bottomBorder ) {
					
					let startX = x * this.props.pixelWidth;
					let endX = startX +(+this.props.pixelWidth);
					
					let startY = (y+1) * this.props.pixelHeight;
					let endY = startY;
					
					ctx.beginPath();
					ctx.moveTo( startX, startY );
					ctx.lineTo( endX, endY );
					ctx.stroke();
					ctx.closePath();
				}
				
				if ( currentCell.rightBorder ) {
					
					let startX = (x+1) * this.props.pixelWidth;
					let endX = startX;
					
					let startY = y * this.props.pixelHeight;
					let endY = startY + (+this.props.pixelHeight);
					
					ctx.beginPath();
					ctx.moveTo( startX, startY );
					ctx.lineTo( endX, endY );
					ctx.stroke();
					ctx.closePath();
				}
			}
		}

		/*
    ctx.fillStyle = '#44eaed';

    console.log(this.state);
    
    const borderTopX = this.state.borders[0][0] * this.props.pixelWidth;
    const borderTopY = this.state.borders[0][1] * this.props.pixelHeight;

    const borderWidth = this.state.borders[1][0] * this.props.pixelWidth - borderTopX;
    const borderHeight = this.state.borders[1][1] * this.props.pixelHeight - borderTopY;

    ctx.strokeStyle = '#44eaed';
    ctx.strokeRect(borderTopX, borderTopY, borderWidth, borderHeight);
		 * 
		 */
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

