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
  static shipSize = 40;
  constructor(ctx, x, y) {
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
      Ship.shipSize / 2,
      this.movementAngle,
      this.speed
    );
    this.x += x;
    this.y += y;

    this.drawImageRot(
      img,
      this.x - Ship.shipSize / 2,
      this.y - Ship.shipSize / 2,
      Ship.shipSize,
      Ship.shipSize,
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

class Bullet {
  static radius = 2;
  constructor(ctx, x, y, velocityX, velocityY) {
    this.x = x;
    this.y = y;
    this.vx = velocityX;
    this.vy = velocityY;
    this.ctx = ctx;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, Bullet.radius, 0, 2 * Math.PI, false);
    this.ctx.fillStyle = "#ff0000";
    this.ctx.fill();
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

const bullets = [];
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
    case " ":
      if (enable) {
        const { x, y } = getNextCoordinatesWithAngle(
          Bullet.radius,
          ship.shipAngle,
          ship.speed + 2
        );
        bullets.push(new Bullet(ctx, ship.x, ship.y, x, y));
      }
      break;
  }
}

function refreshScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  ship.update();
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
    if (
      bullets[i].x < 0 ||
      bullets[i].x > window.innerWidth ||
      bullets[i].y < 0 ||
      bullets[i].y > window.innerHeight
    ) {
      bullets.splice(i, 1);
      i--;
    }
  }

  requestAnimationFrame(refreshScreen);
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  setCanvasSize();
});
