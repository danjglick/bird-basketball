const PIXEL_SHIM = visualViewport.width / 10
const BALL_SPEED_DIVISOR = 2
const GRAVITY = 10
const MINIMUM_SPEED = 13
const GROUND_COLOR = "#36454F"

let canvas;
let context;
let ball = {
  xPosition: visualViewport.width / 2,
  yPosition: visualViewport.height - 70,
  xVelocity: 0,
  yVelocity: 0,
  radius: visualViewport.width / 20,
  color: "orange"
}
let touchstart = {
  xPosition: 0,
  yPosition: 0
}
let isShooting = false

function startGame() {
  canvas = document.getElementById("canvas")
  canvas.width = visualViewport.width
  canvas.height = visualViewport.height
  context = canvas.getContext('2d')
  document.addEventListener("touchstart", handleTouchstart, { passive: false })
  document.addEventListener("touchmove", handleTouchmove, { passive: false })
  document.addEventListener("keydown", (e) => e.preventDefault(), { passive: false })
  document.addEventListener("wheel", (e) => e.preventDefault(), { passive: false })
  loopGame()
}

function handleTouchstart(e) {
  touchstart.xPosition = e.touches[0].clientX
  touchstart.yPosition = e.touches[0].clientY
  if (isNearby(touchstart, ball)) {
    isShooting = true
  }
}

function handleTouchmove(e) {
  e.preventDefault()
  if (isShooting) {
    ball.xVelocity = (e.touches[0].clientX - touchstart.xPosition) / BALL_SPEED_DIVISOR
    ball.yVelocity = (e.touches[0].clientY - touchstart.yPosition) / BALL_SPEED_DIVISOR
  }
}

function loopGame() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  moveBall()
  drawGround()
  drawBall()
  handleDeflections()
  requestAnimationFrame(loopGame)
}

function moveBall() {
  ball.xPosition += ball.xVelocity
  ball.yPosition += ball.yVelocity
  if (ball.yVelocity != 0) {  
    ball.yVelocity += GRAVITY
  }  
}

function drawGround() {
  context.beginPath()
  context.rect(0, canvas.height - 100, canvas.width, 100)
  context.fillStyle = GROUND_COLOR
  context.fill()
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPosition, ball.yPosition, ball.radius, 0, 2 * Math.PI)
  context.fillStyle = ball.color
  context.fill()
}

function handleDeflections() {
  if (ball.yPosition >= canvas.height - 100) {
    if (ball.yVelocity < MINIMUM_SPEED) {
      ball.yVelocity = 0
    } else {
      ball.yVelocity = -ball.yVelocity / 1.5
    }
    if (Math.abs(ball.xVelocity) < MINIMUM_SPEED) {
      ball.xVelocity = 0
    }
  }
}

function isNearby(objectA, objectB, threshold = PIXEL_SHIM) {
  return (
    Math.abs(objectA.xPosition - objectB.xPosition) < threshold &&
    Math.abs(objectA.yPosition - objectB.yPosition) < threshold
  )
}