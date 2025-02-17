const PIXEL_SHIM = visualViewport.width / 10
const BALL_SPEED_DIVISOR = 5
const GRAVITY = 10
const MINIMUM_SPEED = 13
const GROUND_HEIGHT = 100
const GROUND_COLOR = "#36454F"
const BALL_STARTING_XPOSITION = visualViewport.width / 2
const BALL_STARTING_YPOSITION = visualViewport.height - 70
const BALL_RADIUS = visualViewport.width / 20
const BALL_COLOR = "orange"

let canvas
let context
let ball = {
  xPosition: BALL_STARTING_XPOSITION,
  yPosition: BALL_STARTING_YPOSITION,
  xVelocity: 0,
  yVelocity: 0,
  radius: BALL_RADIUS,
  color: BALL_COLOR
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

function loopGame() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  moveBall()
  handleDeflections()
  drawGround()
  drawBall()
  requestAnimationFrame(loopGame)
}

function handleTouchstart(e) {
  touchstart.xPosition = e.touches[0].clientX
  touchstart.yPosition = e.touches[0].clientY
  if (isClose(touchstart, ball)) {
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

function moveBall() {
  ball.xPosition += ball.xVelocity
  ball.yPosition += ball.yVelocity
  if (ball.yVelocity != 0) {  
    ball.yVelocity += GRAVITY
  }  
}

function drawGround() {
  context.beginPath()
  context.rect(0, canvas.height - GROUND_HEIGHT, canvas.width, GROUND_HEIGHT)
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

function isClose(objectA, objectB, max_distance = PIXEL_SHIM) {
  return (
    Math.abs(objectA.xPosition - objectB.xPosition) < max_distance &&
    Math.abs(objectA.yPosition - objectB.yPosition) < max_distance
  )
}