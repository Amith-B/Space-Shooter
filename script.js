const shipImg = new Image();
shipImg.src = "./assets/ship.png";

const planetsImg = new Image();
planetsImg.src = "./assets/planets.png";

const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

let ship;
shipImg.onload = () => {
  setCanvasSize();
  ship = new Ship(ctx, canvas.width / 2, canvas.height / 2);
  refreshScreen();
};

let planets = [];
planetsImg.onload = () => {
  startAsteroids();
};

function startAsteroids() {
  setInterval(() => {
    planets.push(new Planet(ctx));
  }, 2000);
}

const keyPressStates = {
  up: false,
  left: false,
  right: false,
  shoot: false,
};

class Planet {
  constructor(ctx) {
    this.ctx = ctx;
    if (Math.random() > 0.5) {
      this.x = Math.random() > 0.5 ? window.innerWidth : 0;
      this.y = Math.round(Math.random() * window.innerHeight);
    } else {
      this.x = Math.round(Math.random() * window.innerWidth);
      this.y = Math.random() > 0.5 ? window.innerHeight : 0;
    }

    const angle = Math.atan2(ship.y - this.y, ship.x - this.x);

    this.size = Math.round(Math.random() * 60 + 30);
    this.asteroidAngle = 0;
    this.angleInc = (Math.random() + 1) * (Math.random() > 0.5 ? -1 : 1);

    this.velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    this.imagePositionX = Math.round(Math.random() * 3) * 125;
    this.imagePositionY = Math.round(Math.random() * 3) * 125;

    this.vectorImagePositions = {
      sx: Math.round(Math.random() * 2) * (planetsImg.width / 3),
      sy: Math.round(Math.random() * 2) * (planetsImg.height / 3),
      sWidth: planetsImg.width / 3,
      sHeight: planetsImg.height / 3,
    };
  }

  update() {
    this.asteroidAngle += this.angleInc;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    drawImageRot(
      this.ctx,
      planetsImg,
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.size,
      this.size,
      this.asteroidAngle,
      this.vectorImagePositions.sx,
      this.vectorImagePositions.sy,
      this.vectorImagePositions.sWidth,
      this.vectorImagePositions.sHeight
    );
  }
}

class Ship {
  static size = 40;
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
      Ship.size / 2,
      this.movementAngle,
      this.speed
    );
    this.x += x;
    this.y += y;

    drawImageRot(
      this.ctx,
      shipImg,
      this.x - Ship.size / 2,
      this.y - Ship.size / 2,
      Ship.size,
      Ship.size,
      this.shipAngle
    );
  }

  drawImageRot(shipImg, x, y, width, height, deg) {
    this.ctx.save();

    const rad = (deg * Math.PI) / 180;

    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(rad);
    this.ctx.drawImage(
      shipImg,
      (width / 2) * -1,
      (height / 2) * -1,
      width,
      height
    );

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
    this.ctx.fillStyle = "#34a9de";
    this.ctx.fill();
  }
}

function drawImageRot(
  ctx,
  img,
  x,
  y,
  width,
  height,
  deg,
  sx = 0,
  sy = 0,
  sWidth,
  sHeight
) {
  ctx.save();

  const rad = (deg * Math.PI) / 180;

  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(rad);
  ctx.drawImage(
    img,
    sx,
    sy,
    sWidth || img.width,
    sHeight || img.height,
    (width / 2) * -1,
    (height / 2) * -1,
    width,
    height
  );

  ctx.restore();
}

ctx.drawImage;

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
      if (enable && !keyPressStates.shoot) {
        const { x, y } = getNextCoordinatesWithAngle(
          Bullet.radius,
          ship.shipAngle,
          ship.speed + 2
        );
        bullets.push(new Bullet(ctx, ship.x, ship.y, x, y));
      }
      keyPressStates.shoot = enable;
      break;
  }
}

let animationId;
function refreshScreen() {
  animationId = requestAnimationFrame(refreshScreen);

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

    if (bullets[i]) {
      for (let ai = 0; ai < planets.length; ai++) {
        if (bullets[i] && planets[ai]) {
          const dist = Math.hypot(
            bullets[i].x - planets[ai].x,
            bullets[i].y - planets[ai].y
          );

          if (dist - Bullet.radius - planets[ai].size / 2 < 1) {
            planets.splice(ai, 1);
            bullets.splice(i, 1);
            ai--;
            i--;
          }
        }
      }
    }
  }

  for (let i = 0; i < planets.length; i++) {
    planets[i].update();

    const dist = Math.hypot(ship.x - planets[i].x, ship.y - planets[i].y);

    if (dist - Ship.size / 2 - planets[i].size / 2 < 1) {
      cancelAnimationFrame(animationId);
    }
    if (
      planets[i].x + planets[i].size / 2 < 0 ||
      planets[i].x - planets[i].size / 2 > window.innerWidth ||
      planets[i].y + planets[i].size / 2 < 0 ||
      planets[i].y - planets[i].size / 2 > window.innerHeight
    ) {
      planets.splice(i, 1);
      i--;
    }
  }
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  setCanvasSize();
});
