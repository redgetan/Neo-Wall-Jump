const Player = require("./entities/player")
const Wall   = require("./entities/wall")
const Ground = require("./entities/ground")
const Obstacle = require("./entities/obstacle")
const Constants = require("./constants")

class Main {

  static run() {
    this.initRenderer()
    this.initSound()
    this.initPhysics()
    this.initControls()

    this.gameLoopRunner = this.gameLoop.bind(this)
    requestAnimationFrame(this.gameLoopRunner)
  }

  static initSound() {
    this.bgSound = new Howl({
      src: ['./assets/audio/background.mp3'],
      loop: true
    })

    this.bgSound.play()
  }

  static initControls() {
    window.keyPresses = {}

    document.addEventListener("keydown", (event) => {
      switch(event.keyCode){
        case 39: this.player.right = 1; break; // right key
        case 38: 
          this.player.jump(); 
          break; // up key
        case 37: this.player.left = 1; break; // left key
        default:
      }

      this.player.controller.input[0] = this.player.right - this.player.left
    })

    document.addEventListener("keyup", (event) => {
      switch(event.keyCode){
        case 39: this.player.right = 0; break; // right key
        case 38: this.player.stopJump(); break; // up key
        case 37: this.player.left = 0; break; // left key
        default:
      }

      this.player.controller.input[0] = this.player.right - this.player.left
    })
  }

  static initPhysics() {
    window.world = this.world = new p2.World({
        gravity: [0, -50]
    })

    this.world.defaultContactMaterial.friction = 0.9
    this.world.defaultContactMaterial.restitution = 0

    this.world.on('postStep', function(evt){
      this.player.update(this.world.lastTimeStep)
      this.makeObstaclesFall()
      this.renderObjects()
    }.bind(this))

    this.initEntities()
  }

  static makeObstaclesFall() {
    for (var i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i]
      obstacle.body.position[1] -= 1
    }
  }

  static createObstacles(game) {
    let obstacles = []

    const leftWallXMax = 128
    const rightWallXMin = Constants.game.width - 128

    for (var i = 0; i < 5; i++) {
      let x = this.randomBetween(leftWallXMax + 64, rightWallXMin - 64)
      let y = this.randomBetween(500, 1000)
      let obstacle = new Obstacle(game, x, y)
      obstacles.push(obstacle)
    }

    return obstacles
  }

  static randomBetween(min, max) {
    return Math.floor(Math.random() * max) + min 
  }

  static initEntities() {
    window.player = this.player = new Player(this, 250, 50)
    window.ground = this.ground = new Ground(this, window.innerWidth / 2, -100)
    window.obstacles = this.obstacles = this.createObstacles(this)

    this.walls  = [
      new Wall(this, 64,0),
      new Wall(this, Constants.game.width - 64, 0)
    ]
  }

  static initRenderer() {
    window.app = this.app = new PIXI.Application({
      forceCanvas: true,
      width: Constants.game.width,
      height: window.innerHeight
    })

    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()){
      type = "canvas"
    }

    PIXI.utils.sayHello(type)

    this.app.renderer.view.style.position = "absolute"
    this.app.renderer.view.style.display = "block"

    this.app.stage.position.y = this.app.renderer.height / this.app.renderer.resolution
    this.app.stage.scale.y = -1
    const stageOffet = 150
    this.app.stage.position.y -= stageOffet

    this.origStageY = this.app.stage.position.y

    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(this.app.view)
  }


  static renderPlayer(x, y, width, height) {
    this.player.sprite.x = x
    this.player.sprite.y = y
  }

  static renderWall(x, y, width, height) {
  }

  static renderObstacle(obstacle, x, y, width, height) {
    obstacle.sprite.position.set(x,y)
  }

  static gameLoop(time) {
    const fixedTimeStep = 1 / 60
    const maxSubSteps = 10

    if (typeof this.app !== "undefined") {
      for (var i = this.app.stage.children.length - 1; i >= 0; i--) {  
        // this.app.stage.removeChild(this.app.stage.children[i])
      }
    }

    // Compute elapsed time since last render frame
    let deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;

    // Move bodies forward in time
    this.world.step(fixedTimeStep, deltaTime, maxSubSteps);

    this.lastTime = time

    requestAnimationFrame(this.gameLoopRunner);
  }

  static renderObjects() {
    this.renderStage()
    this.renderScore()

    this.renderPlayer(this.player.body.position[0], this.player.body.position[1], this.player.getWidth(), this.player.getHeight())
    for (var i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i]
      this.renderObstacle(obstacle, obstacle.body.position[0], obstacle.body.position[1], obstacle.getWidth(), obstacle.getHeight())
    }

    this.updateDebugLog()
  }

  static renderStage() {
    const playerStandingYPosition = (this.player.getHeight() / 2) + (this.ground.getHeight() / 2)
    const stageYDiff = this.player.body.position[1] - playerStandingYPosition
    this.app.stage.position.y = this.origStageY + stageYDiff
  }

  static renderScore() {
    const score = document.querySelector("#score_container .value")
    score.innerText = Math.floor(this.player.getMaxHeightReached() / 50) + " ft"

    const height = document.querySelector("#height_container .value")
    height.innerText = Math.floor(this.player.body.position[1] / 50) + " ft"
  }

  static updateDebugLog() {
    const player = window.player.controller

    const debugContainer = document.querySelector("#debug_container")
    if (!debugContainer) return

    debugContainer.innerHTML = [
      'player.collisions.above: ' + player.collisions.above,
      'player.collisions.below: ' + player.collisions.below,
      'player.collisions.left: ' + player.collisions.left,
      'player.collisions.right: ' + player.collisions.right,
      'player.collisions.climbingSlope: ' + player.collisions.climbingSlope,
      'player.collisions.descendingSlope: ' + player.collisions.descendingSlope,
      'player.collisions.slopeAngle: ' + player.collisions.slopeAngle,
      'player.collisions.slopeAngleOld: ' + player.collisions.slopeAngleOld,
      'player.collisions.faceDir: ' + player.collisions.faceDir,
      'player.collisions.fallingThroughPlatform: ' + player.collisions.fallingThroughPlatform
    ].join('<br>');
  }

}

Main.run()
