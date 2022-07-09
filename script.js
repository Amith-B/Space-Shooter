const img = new Image();
img.src = "./assets/ship.png";

const shipSize = 60;

const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

let ship;
img.onload = () => {
  setCanvasSize();
  ship = new Ship(ctx, canvas.width / 2, canvas.height / 2);
  refreshScreen();
};

const keyPressStates = {
  up: false,
  left: false,
  right: false,
};

class Ship {
  constructor(ctx, x, y) {
    this.shipSize = 40;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.speed = 0;
    this.angleInc = 0;
    this.shipAngle = 0;
    this.movementAngle = 0;
  }

  update() {
    this.shipAngle += this.angleInc;
    if (Math.abs(this.shipAngle) === 360) {
      this.shipAngle = 0;
    }

    if (keyPressStates.up) {
      if (this.speed < 0.15) {
        this.speed += 0.003;
      }
      this.movementAngle = this.shipAngle;
    } else {
      if (this.speed > 0) {
        this.speed -= 0.0005;
      } else {
        this.speed = 0;
      }
    }

    const { x, y } = getNextCoordinatesWithAngle(
      this.shipSize / 2,
      this.movementAngle,
      this.speed
    );
    this.x += x;
    this.y += y;

    this.drawImageRot(
      img,
      this.x - this.shipSize / 2,
      this.y - this.shipSize / 2,
      this.shipSize,
      this.shipSize,
      this.shipAngle
    );
  }

  drawImageRot(img, x, y, width, height, deg) {
    this.ctx.save();

    const rad = (deg * Math.PI) / 180;

    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(rad);
    this.ctx.drawImage(img, (width / 2) * -1, (height / 2) * -1, width, height);

    this.ctx.restore();
  }
}

function getNextCoordinatesWithAngle(radius, degree, velocity = 1) {
  let deg = 0;

  if (degree < 180) {
    deg = 180 - degree;
  }

  if (degree > 180) {
    deg = 360 - (degree - 180);
  }
  return {
    x: radius * Math.sin((Math.PI * 2 * deg) / 360) * velocity,
    y: radius * Math.cos((Math.PI * 2 * deg) / 360) * velocity,
  };
}

window.addEventListener("keydown", (event) => {
  updateKeyState(event, true);
});

window.addEventListener("keyup", (event) => {
  updateKeyState(event, false);
});

function updateKeyState(event, enable) {
  switch (event.key) {
    case "ArrowUp":
      keyPressStates.up = enable;
      break;
    case "ArrowLeft":
      ship.angleInc = enable ? -4 : 0;
      break;
    case "ArrowRight":
      ship.angleInc = enable ? 4 : 0;
      break;
  }
}

function refreshScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ship.update();
  requestAnimationFrame(refreshScreen);
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  setCanvasSize();
});
