const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const a = 2 * Math.PI / 6;
const r = 50;

function init() {
  drawGrid(canvas.width, canvas.height);
}
init();

function drawGrid(width, height) {
  for (let y = r; y + r * Math.sin(a) < height; y += r * Math.sin(a)) {
    for (let x = r, j = 0; x + r * (1 + Math.cos(a)) < width; x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)) {
      drawHexagon(x, y);
    }
  }
}

function drawHexagon(x, y) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(x + r * Math.cos(a * i), y + r * Math.sin(a * i));
  }
  ctx.closePath();
  ctx.stroke();
}


        const X_PIXELS=20
        const Y_PIXELS=20
        const X_OFFSET=400
        const Y_OFFSET=100

        const X_IN_PLACE=1332
        const Y_IN_PLACE=795
        foreground.addEventListener('mousemove', event =>
        {
            let p = getMousePos(foreground, event);
            let x = Math.floor((p.x)/X_PIXELS);
            let y = Math.floor((p.y-Y_OFFSET)/Y_PIXELS) ;
            fg.clearRect(0, 0, fg.canvas.width, fg.canvas.height);
            drawText((x+ X_IN_PLACE)+"", p.x+40, p.y - 30)
            drawText((y+ Y_IN_PLACE)+"", p.x+40, p.y + 50)

            fg.lineWidth = 4;
            let circle_x = x*X_PIXELS+X_PIXELS/2;
            let circle_y = y*Y_PIXELS+Y_OFFSET+Y_PIXELS/2;
            fg.beginPath()
            fg.strokeStyle = 'red';
            fg.arc(circle_x, circle_y, X_PIXELS-6, 0, 2 * Math.PI, false);
            fg.stroke()

            fg.beginPath()
            fg.strokeStyle = 'white';
            fg.arc(circle_x, circle_y, X_PIXELS-4, 0, 2 * Math.PI, false);
            fg.stroke()

            fg.beginPath()
            fg.strokeStyle = 'black';
            fg.arc(circle_x, circle_y, X_PIXELS, 0, 2 * Math.PI, false);
            fg.stroke()

        });