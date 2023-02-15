const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function init() {}
init();

const a = 2 * Math.PI / 6;
const r = 50;


function drawHexagon(x, y) {
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.stroke();
}
