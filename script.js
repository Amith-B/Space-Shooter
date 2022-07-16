const shipImg = new Image();
shipImg.src = "./assets/ships.png";

const planetsImg = new Image();
planetsImg.src = "./assets/planets.png";

const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const gameOverDialog = document.getElementById("gameOverDialog");
const shipList = document.getElementById("ship-list");
const initialInstructionDialog = document.getElementById(
  "initialInstructionDialog"
);

initialInstructionDialog.showModal();

const finalScore = document.getElementById("final-score");

let score = 0;
let bulletsShot = 0;
let planetsBlasted = 0;

let ship;
shipImg.onload = () => {
  setCanvasSize();
  ship = new Ship(ctx, canvas.width / 2, canvas.height / 2);
  refreshScreen();
};

let planets = [];

let bullets = [];
let blastParticles = [];

let planetsLoaded = false;
let instructionClosed = false;

planetsImg.onload = () => {
  planetsLoaded = true;
  startPlanetMovement();
};

let timmer;
function startPlanetMovement() {
  if (planetsLoaded && instructionClosed) {
    timmer = setInterval(() => {
      planets.push(new Planet(ctx));
    }, 2000);
  }
}

function closeInstruction() {
  instructionClosed = true;
  initialInstructionDialog.open = false;
  startPlanetMovement();
}

const keyPressStates = {
  up: false,
  left: false,
  right: false,
  shoot: false,
};

function restartGame() {
  gameOverDialog.open = false;

  score = 0;
  bulletsShot = 0;
  planetsBlasted = 0;
  scoreElement.innerHTML = `Score: ${score}`;
  keyPressStates.up = false;
  keyPressStates.left = false;
  keyPressStates.right = false;
  keyPressStates.shoot = false;

  planets = [];
  bullets = [];
  blastParticles = [];
  ship.reset(canvas.width / 2, canvas.height / 2);
  startPlanetMovement();

  refreshScreen();
}

function selectShip(shipId) {
  Array.from(shipList.children).forEach((shipItem, i) => {
    shipItem.classList.toggle;
    if (i === shipId) {
      shipItem.classList.add("active");
      Ship.shipNumber = shipId;
    } else {
      shipItem.classList.remove("active");
    }
  });
}
class Planet {
  constructor(ctx) {
    this.ctx = ctx;

    // to generate random x and y position for a planet
    if (Math.random() > 0.5) {
      this.x = Math.random() > 0.5 ? window.innerWidth : 0;
      this.y = Math.round(Math.random() * window.innerHeight);
    } else {
      this.x = Math.round(Math.random() * window.innerWidth);
      this.y = Math.random() > 0.5 ? window.innerHeight : 0;
    }

    // angle from initial planet position to the ships position
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

    const matrixX = Math.round(Math.random() * 2);
    const matrixY = Math.round(Math.random() * 2);

    // random planet to be choosed from vector image
    this.vectorImagePositions = {
      sx: matrixX * (planetsImg.width / 3),
      sy: matrixY * (planetsImg.height / 3),
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
  static size = 50;
  static shipNumber = 0;
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

  // reset the ship position to center
  reset(x, y) {
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
      this.shipAngle,
      Ship.shipNumber * (shipImg.width / 4),
      0,
      shipImg.width / 4,
      shipImg.height
    );
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
    this.ctx.fillStyle = "orange";
    this.ctx.strokeStyle = "#ff00008f"; //"#34a9de";
    this.ctx.lineWidth = "2";
    this.ctx.stroke();
    this.ctx.fill();
  }
}

class BlastParticle {
  static friction = 0.99;
  constructor(ctx, x, y, radius, velocity, img, sx, sy, sWidth, sHeight) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.img = img;
    this.velocity = velocity;
    this.alpha = 1;
    this.ctx = ctx;
    this.sx = sx;
    this.sy = sy;
    this.sWidth = sWidth;
    this.sHeight = sHeight;
  }

  draw() {
    this.ctx.save();
    this.ctx.globalAlpha = this.alpha;

    drawImageRot(
      this.ctx,
      this.img,
      this.x,
      this.y,
      this.radius * 2,
      this.radius * 2,
      0,
      this.sx,
      this.sy,
      this.sWidth,
      this.sHeight
    );

    this.ctx.restore();
  }

  update() {
    this.draw();
    this.velocity.x *= BlastParticle.friction;
    this.velocity.y *= BlastParticle.friction;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
    this.alpha -= 0.01;
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
          ship.speed + 2.5
        );
        bullets.push(new Bullet(ctx, ship.x, ship.y, x, y));
        bulletsShot += 1;
      }
      keyPressStates.shoot = enable;
      break;
  }
}

let animationId;
function refreshScreen() {
  animationId = requestAnimationFrame(refreshScreen);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ship.update();

  blastParticles.forEach((particle, particleIndex) => {
    if (particle.alpha <= 0) {
      blastParticles.splice(particleIndex, 1);
    } else {
      particle.update();
    }
  });

  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();

    // remove bullet going out of window
    if (
      bullets[i].x < 0 ||
      bullets[i].x > canvasWidth ||
      bullets[i].y < 0 ||
      bullets[i].y > canvasHeight
    ) {
      bullets.splice(i, 1);
      i--;
    }

    if (bullets[i]) {
      for (let pi = 0; pi < planets.length; pi++) {
        if (bullets[i] && planets[pi]) {
          // distance between bullets and planet
          const dist = Math.hypot(
            bullets[i].x - planets[pi].x,
            bullets[i].y - planets[pi].y
          );

          // bullet hits planet
          if (dist - Bullet.radius - planets[pi].size / 2 < 1) {
            // score distribution based on planet size
            // smaller the planet higher the score
            if (planets[pi].size > 50) {
              score += 10;
            } else if (planets[pi].size > 40) {
              score += 20;
            } else if (planets[pi].size > 30) {
              score += 30;
            }

            // update score
            scoreElement.innerHTML = `Score: ${score}`;
            for (let bpi = 0; bpi < planets[pi].size; bpi++) {
              // create planet blast effect
              blastParticles.push(
                new BlastParticle(
                  ctx,
                  bullets[i].x,
                  bullets[i].y,
                  Math.random() * 5,
                  {
                    x: (Math.random() - 0.5) * (Math.random() * 8),
                    y: (Math.random() - 0.5) * (Math.random() * 8),
                  },
                  planetsImg,
                  planets[pi].vectorImagePositions.sx,
                  planets[pi].vectorImagePositions.sy,
                  planets[pi].vectorImagePositions.sWidth,
                  planets[pi].vectorImagePositions.sHeight
                )
              );
            }

            planetsBlasted += 1;

            planets.splice(pi, 1);
            bullets.splice(i, 1);
            pi--;
            i--;
          }
        }
      }
    }
  }

  for (let i = 0; i < planets.length; i++) {
    planets[i].update();

    // distance between ship and planet
    const dist = Math.hypot(ship.x - planets[i].x, ship.y - planets[i].y);

    let shipOutOfScreen = false;

    // to end game if ship is out of screen
    if (
      ship.x + Ship.size / 2 < 0 ||
      ship.x - Ship.size / 2 > canvasWidth ||
      ship.y + Ship.size / 2 < 0 ||
      ship.y - Ship.size / 2 > canvasHeight
    ) {
      shipOutOfScreen = true;
    }

    // ship touched to planet
    if (shipOutOfScreen || dist - Ship.size / 2 - planets[i].size / 2 < 1) {
      cancelAnimationFrame(animationId);
      if (timmer) {
        clearTimeout(timmer);
      }
      if (typeof gameOverDialog.showModal === "function") {
        finalScore.innerHTML = `
          Your Score: ${score}<br/>
          Bullets Shot: ${bulletsShot}<br/>
          Planets Blasted: ${planetsBlasted}
        `;
        gameOverDialog.showModal();
      }
      return;
    }

    // remove planets out of screen
    if (
      planets[i].x + planets[i].size / 2 < 0 ||
      planets[i].x - planets[i].size / 2 > canvasWidth ||
      planets[i].y + planets[i].size / 2 < 0 ||
      planets[i].y - planets[i].size / 2 > canvasHeight
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
