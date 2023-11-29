const MILLISECONDS_PER_FRAME = 50
const GRAVITY = -10
const WALLS = {
  right: "right",
  bottom: "bottom",
  left: "left"
}
const PIXEL_SHIM = visualViewport.width / 10
const BALL_RADIUS = visualViewport.width / 20
const POST_BOUNCE_SPEED_DIVISOR = 2
const ENEMY_SPEED_DIVISOR = 50
const BALL_SPEED_DIVISOR = 2
const MINIMUM_SPEED = 30
const ENEMY_BALL_SPEED = 100
const BLUE_COLOR = "Purple"
const RED_COLOR = "IndianRed"
const HOOP = {
  xPosition: visualViewport.width / 3,
  yPosition: PIXEL_SHIM,
  src: "images/hoop.png",
  diameter: 100
}

let canvas
let context
let ball = {
  xPosition: visualViewport.width / 2,
  yPosition: visualViewport.height - 50,
  xVelocity: 0,
  yVelocity: 0,
  color: "orange"
}
let enemies = []
let teammates = []
let touchstart = {
  xPosition: 0,
  yPosition: 0
}
let redScore = 0
let blueScore = 0
let isThrowing = false
let offensiveTeam = teammates
let ballPossessor = {}

function startGame() {
  canvas = document.getElementById("canvas")
  canvas.width = visualViewport.width
  canvas.height = visualViewport.height
  context = canvas.getContext('2d')
  document.addEventListener("touchstart", handleTouchstart)
  document.addEventListener("touchmove", handleTouchmove, { passive: false })
  document.getElementById("addBird").addEventListener("click", addBird)
  document.getElementById("removeBird").addEventListener("click", removeBird)
  loopGame()
}

function handleTouchstart(e) {
  touchstart.xPosition = e.touches[0].clientX
  touchstart.yPosition = e.touches[0].clientY
  if (isClose(touchstart, ball) || (touchstart.yPosition > canvas.height - canvas.height / 5)) {
    isThrowing = true
  } else {
    addTeammate(touchstart)
  }
}

function handleTouchmove(e) {
  e.preventDefault()
  if (isThrowing) {
    ball.xVelocity = (e.touches[0].clientX - touchstart.xPosition) / BALL_SPEED_DIVISOR
    ball.yVelocity = (e.touches[0].clientY - touchstart.yPosition) / BALL_SPEED_DIVISOR
  }
}

function loopGame() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  moveBall()
  moveEnemies()
  for (let i = 0; i < Object.keys(WALLS).length; i++) {
    let wall = WALLS[Object.keys(WALLS)[i]]
    if (isBallInWall(wall)) {
      handleBallInWall(wall)
    }
  }
  let players = teammates.concat(enemies)
  for (let i = 0; i < players.length; i++) {
    if (isBallInPlayer(players[i])) {
      handleBallInPlayer(players[i])
      if (enemies.includes(players[i])) {
        decideBallPath()
      }
    }
  }
  if (isBallInHoop()) {
    handleBallInHoop()
  }
  drawHoop()
  drawEnemies()
  drawTeammates()
  drawBall()
  setTimeout(loopGame, MILLISECONDS_PER_FRAME)
}

function moveBall() {
  ball.xPosition += ball.xVelocity
  ball.yPosition += ball.yVelocity
  if (ball.yVelocity != 0) {
    ball.yVelocity -= GRAVITY
  }
}

function moveEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].xPosition += enemies[i].xVelocity
    enemies[i].yPosition += enemies[i].yVelocity
  }
}

function isBallInWall(wall) {
  switch(wall) {
    case WALLS.bottom:
      if (ball.yPosition > canvas.height - PIXEL_SHIM) {
        return true
      }
      break
    case WALLS.right:
      if (ball.xPosition > canvas.width - PIXEL_SHIM) {
        return true
      }
      break
    case WALLS.left:
      if (ball.xPosition < PIXEL_SHIM) {
        return true
      }
      break
  }
  return false
}

function handleBallInWall(wall) {
  if (ball.yVelocity != 0) {
    document.getElementById("bounce").play()
  }
  switch (wall) {
    case WALLS.bottom:
      console.log(ball.yVelocity)
      if (ball.yVelocity < MINIMUM_SPEED) {
        ball.yVelocity = 0
      } else {
        ball.yVelocity = -ball.yVelocity / 1.5
      }
      if (Math.abs(ball.xVelocity) < MINIMUM_SPEED) {
        ball.xVelocity = 0
      } 
      break
    case WALLS.right:
      ball.xVelocity = -ball.xVelocity / 1.1
      break
    case WALLS.left:
      ball.xVelocity = Math.abs(ball.xVelocity) / 1.1
      break
  }
}

function isBallInPlayer(player) {
  if (isClose(ball, player)) {
    ballPossessor = player
    return true  
  } else {
    return false
  }  
}

function handleBallInPlayer() {
  ball.xVelocity = 0
  ball.yVelocity = 0
}

function decideBallPath() {
  let shotPath = calculateBallPath(HOOP)
  if (isPathClear(shotPath, teammates)) {
    ball.xVelocity = shotPath.xVelocity
    ball.yVelocity = shotPath.yVelocity    
  } else {
    for (let i = 0; i < enemies.length; i++) {
      let passPath = calculateBallPath(enemies[i])
      if (isPathClear(passPath, teammates)) {
        ball.xVelocity = passPath.xVelocity
        ball.yVelocity = passPath.yVelocity 
        break 
      }
    }
  }   
}

function calculateBallPath(target) {
  let xChange = ballPossessor.xPosition - target.xPosition
  let yChange = ballPossessor.yPosition - target.yPosition
  return calculateXYVelocity(xChange, yChange, ENEMY_BALL_SPEED, GRAVITY)
}

function calculateXYVelocity(xChange, yChange, speed, gravity) {
  // https://physics.stackexchange.com/questions/56265/how-to-get-the-angle-needed-for-a-projectile-to-pass-through-a-given-point-for-t
  let radians = Math.atan(
    (speed ** 2 / (gravity * xChange)) - 
    (
      (
        (speed ** 2 * (speed ** 2 - 2 * gravity * yChange)) / 
        (gravity ** 2 * xChange ** 2) 
      ) 
      - 1
    ) 
    ** 0.5
  )
  let xVelocity = (ball.xPosition <= canvas.width / 2 ? Math.cos(radians) : -Math.cos(radians)) * speed
  let yVelocity = Math.sin(radians) * speed
  return {
    xVelocity: xVelocity,
    yVelocity: yVelocity
  }
}

function isPathClear(path, obstacles) {
  let scout = JSON.parse(JSON.stringify(ball))
  for (let i = 0; i < 1000; i++) {
    scout.xPosition += path.xVelocity
    scout.yPosition += path.yVelocity
    for (let j = 0; j < obstacles.length; j++) {
      if (isClose(scout, obstacles[j])) {
        return false    
      }
    }  
  }
  return true
}

function isBallInHoop() {
  isWithinLeftBorder = ball.xPosition > HOOP.xPosition
  isWithinRightBorder = ball.xPosition < HOOP.xPosition + HOOP.diameter
  isWithinTopBorder = ball.yPosition > HOOP.yPosition
  isWithinBottomBorder = ball.yPosition < HOOP.yPosition + HOOP.diameter
  isHorizontallyAligned = isWithinLeftBorder && isWithinRightBorder
  isVerticallyAligned = isWithinTopBorder && isWithinBottomBorder
  isFullyAligned = isHorizontallyAligned && isVerticallyAligned
  isHeadingDown = ball.yVelocity > 0
  if (isFullyAligned && isHeadingDown) {
    return true
  }
  return false
}

function handleBallInHoop() {
  if (teammates.includes(ballPossessor)) {
    blueScore += 1
    document.getElementById("blueScore").innerHTML = String(blueScore)
  } else {
    redScore += 1
    document.getElementById("redScore").innerHTML = String(redScore)
  }
  
  document.getElementById("swish").play()
}

function addTeammate(touchstart) {
  if (touchstart.yPostion > 40) {  
    teammates.push({
      xPosition: touchstart.xPosition,
      yPosition: touchstart.yPosition
    })
    if (teammates.length == 3) {
      teammates.shift()     
    }
  }  
}

function addBird(e) {
  enemies.push({
    xPosition: Math.random() * visualViewport.width,
    yPosition: Math.random() * visualViewport.height,
    xVelocity: 0,
    yVelocity: 0
  })
  resetScore()  
}

function removeBird(e) {
  enemies.pop()
  resetScore()
}

function resetScore() {
  blueScore = 0
  document.getElementById("blueScore").innerHTML = String(blueScore)
  redScore = 0
  document.getElementById("redScore").innerHTML = String(redScore)
}

function drawEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    context.beginPath()
    context.arc(enemies[i].xPosition, enemies[i].yPosition, BALL_RADIUS, 0, 2 * Math.PI)
    context.fillStyle = RED_COLOR
    context.fill()
  }
}

function drawTeammates() {
  for (let i = 0; i < teammates.length; i++) {    
    context.beginPath()
    context.arc(teammates[i].xPosition, teammates[i].yPosition, BALL_RADIUS, 0, 2 * Math.PI)
    context.fillStyle = BLUE_COLOR
    context.fill()
  }
}

function drawHoop() {
  let element = document.createElement("IMG")
  element.src = HOOP.src
  context.drawImage(element, HOOP.xPosition, HOOP.yPosition, HOOP.diameter, HOOP.diameter)
}

function drawBall() {
  context.beginPath()
  context.arc(ball.xPosition, ball.yPosition, BALL_RADIUS, 0, 2 * Math.PI)
  context.fillStyle = ball.color
  context.fill()
}

function isClose(objectA, objectB) {
  return getDistance(objectA, objectB) < PIXEL_SHIM * 2
}

function getDistance(objectA, objectB) {
  return (
    (
      Math.abs(objectA.xPosition - objectB.xPosition) ** 2 + 
      Math.abs(objectA.yPosition - objectB.yPosition) ** 2
    ) 
    ** 0.5
  )  
}
