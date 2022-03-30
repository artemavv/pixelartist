'use strict';

const e = React.createElement;

var randomColor = function() {
    let colors = [
        '#C922D5',
        '#D2691E',
        '#E9967A',
        '#2E8B57',
        '#E0FFFF',
        '#5F9EA0',
        '#4169E1',
        '#F5F5DC',
        '#708090',
        '#FFFF00',
    ]
    return colors[Math.floor(Math.random() * colors.length)];
}

class PixelCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { color: false };
  }

  render() {
    if (this.state.color) {
      console.log(this.state.color);
      return e(
        'div',
        { className: "px-canvas-cell", style: { 'backgroundColor': this.state.color}, onClick: () => this.setState({ color: randomColor() }) },
        ''
      );
    }

    return e(
      'div',
      { className: "px-canvas-cell", onClick: () => this.setState({ color: randomColor() }) },
      ''
    );
  }
}


const domContainer = document.querySelector('#pixel_canvas');
ReactDOM.render(e(PixelCell), domContainer);