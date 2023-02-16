const background = document.getElementById("canvas_background");
const bg = background.getContext("2d");

const foreground = document.getElementById("canvas_foreground");
const fg = foreground.getContext("2d");

const r = 30;
//const a = 2 * Math.PI / 6; //1.0471975512

var HexInteriorAngle = 60;
const a = HexInteriorAngle * (Math.PI / 180); //1.0471975512

var hexID = 0;

drawGrid(foreground.width, foreground.height);

function drawGrid(width, height) 
{
    for (let y = r; y + r * Math.sin(a) < height; y = y + (r * Math.sin(a))) 
    {
        for (let x = r, j = 0; x + (r * (1 + Math.cos(a))) < width; x = x +  (r * (1 + Math.cos(a))), y = y + ((-1) ** j++ * r * Math.sin(a)))
        {
            drawHexagon(x, y);
        }
    }
}

function drawHexagon(x, y) {

    x = Math.round(x);
    y = Math.round(y);

    hexID++;

    bg.textAlign = 'center';
    bg.textBaseline = 'middle';
    bg.strokeStyle = "#AAAAAA";
    bg.strokeText(hexID,x,y);
    //bg.strokeText("(" + x + "," + y + ")", x, y + 10);
    bg.strokeStyle = "#000000";
    

    bg.beginPath();
    for (let side = 0; side < 6; side++) 
    {
        bg.lineTo(x + r * Math.cos(side * a), y + r * Math.sin(side * a));
    }
    bg.closePath();
    bg.stroke();
}




/*



        const X_PIXELS=20
        const Y_PIXELS=20
        const X_OFFSET=400
        const Y_OFFSET=100

        const X_IN_PLACE=1332
        const Y_IN_PLACE=795

        function getMousePos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (evt.clientX - rect.left - 20) / (rect.right - rect.left) * canvas.width,
                y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
            };
        }

        /*function drawGrid(x_0, y_0, x_max, y_max, bg) {
            for (let x = x_0; x <= x_max; x += X_PIXELS) {
                bg.moveTo(x, y_0);
                bg.lineTo(x, y_max);
                for (let y = y_0; y <= y_max; y += Y_PIXELS) {
                    bg.moveTo(x_0, y);
                    bg.lineTo(x_max, y);
                }
            }
            bg.strokeStyle = '#bbbbbb';
            bg.stroke();
        }

        const img = new Image();
        img.onload = function(){
            w = img.width * X_PIXELS
            h = img.height * Y_PIXELS

            bg.canvas.width  = w + X_OFFSET;
            bg.canvas.height = h + 2*Y_OFFSET;

            fg.canvas.width  = bg.canvas.width;
            fg.canvas.height = bg.canvas.height;
            bg.imageSmoothingEnabled = false;
            bg.drawImage(img, 0, 0, img.width, img.height, 0, Y_OFFSET, w, h)
            drawGrid(0, Y_OFFSET, w, h + Y_OFFSET, bg)
        };
		img.src = "images/rPlaceOhio.png";

        function drawText(text, x, y){
            fg.font = '80px Sans-serif';
            fg.strokeStyle = 'black';
            fg.lineWidth = 8;
            fg.strokeText(text, x, y);
            fg.fillStyle = 'white';
            fg.fillText(text, x, y);
        }

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

        foreground.addEventListener('click', event =>
        {
            let p = getMousePos(foreground, event);
            let x = Math.floor((p.x)/X_PIXELS) + X_IN_PLACE;
            let y = Math.floor((p.y-Y_OFFSET)/Y_PIXELS) + Y_IN_PLACE;
            let url ="https://new.reddit.com/r/place/?cx="+x+"&cy="+y+"&px=23"
            window.open(url, '_blank').focus();
        });

        setTimeout(() => {
            // Reload every 5 minutes to fetch updates from the gh
            location.reload(); 
        }, 60000 * 5)

        */
