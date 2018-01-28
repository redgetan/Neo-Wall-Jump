const Player = require("./entities/player")
const Wall   = require("./entities/wall")
const Ground = require("./entities/ground")
const Obstacle = require("./entities/obstacle")
const Constants = require("./constants")

class Main {

  static run() {
    this.physicsLoopListener = this.physicsLoop.bind(this)

    this.initRenderer()
    this.initSound()
    this.initPhysics()
    this.initControls()
  }

  static initSound() {
    this.bgSound = new Howl({
      src: ['background.mp3'],
      loop: true
    })

    this.bgSound.play()
  }

  static initControls() {
    window.keyPresses = {}

    document.addEventListener("keydown", (event) => {
      // keyPresses[event.which] = false


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
      // keyPresses[event.which] = true

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
    console.log("initPhysics")
    window.world = this.world = new p2.World({
        gravity: [0, -50]
    })

    this.world.defaultContactMaterial.friction = 0.9
    this.world.defaultContactMaterial.restitution = 0

    this.world.on('beginContact', function (evt){
      if(evt.bodyA.entity.getCollisionGroup() & evt.bodyB.entity.getCollisionGroup() === 
          Constants.collisionGroup.Player | Constants.collisionGroup.Wall) {
        this.onPlayerWallCollide()
      } 

      if(evt.bodyA.entity.getCollisionGroup() & evt.bodyB.entity.getCollisionGroup() === 
          Constants.collisionGroup.Player | Constants.collisionGroup.Ground) {
        this.onPlayerGroundCollide()
      } 

      console.log("A: " + evt.bodyA.entity.getCollisionGroup() + " B: " + evt.bodyB.entity.getCollisionGroup())
      if(evt.bodyA.entity.getCollisionGroup() & evt.bodyB.entity.getCollisionGroup() === 
          Constants.collisionGroup.Player | Constants.collisionGroup.Obstacle) {
        this.onPlayerObstacleCollide()
      } 
    }.bind(this))

    this.world.on('postStep', function(evt){
      this.player.update(this.world.lastTimeStep)
      this.makeObstaclesFall()
      this.renderObjects()
    }.bind(this))



    this.initEntities()
    this.runWorldPhysics()
  }

  static makeObstaclesFall() {
    for (var i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i]
      obstacle.body.position[1] -= 1
    }
  }

  static onPlayerWallCollide() {
    console.log("player wall collide..")
    // this.player.allowJump()
  }

  static onPlayerGroundCollide() {
    // this.player.allowJump()
  }

  static onPlayerObstacleCollide() {
    console.log("hit obstacle..")
  }

  static createObstacles() {
    const leftWallXMax = 128
    const rightWallXMin = Constants.game.width - 128
    for (var i = 0; i < 5; i++) {
      let x = this.randomBetween(leftWallXMax + 64, rightWallXMin - 64)
      let y = this.randomBetween(500, 1000)
      let obstacle = new Obstacle(this.world, x, y)
      this.obstacles.push(obstacle)
    }
  }

  static randomBetween(min, max) {
    return Math.floor(Math.random() * max) + min 
  }

  static initEntities() {
    window.player = this.player = new Player(this.world, 250, 50)
    this.app.stage.addChild(this.player.sprite)

    window.ground = this.ground = new Ground(this.world, window.innerWidth / 2, -100)

    window.obstacles = this.obstacles = []
    this.createObstacles()

    for (var i = 0; i < this.obstacles.length; i++) {
      let obstacle = this.obstacles[i]
      this.app.stage.addChild(obstacle.sprite)
    }

    this.walls  = [
      new Wall(this.world, 64,0),
      new Wall(this.world, Constants.game.width - 64, 0)
    ]

    for (var i = 0; i < this.walls.length; i++) {
      let wall = this.walls[i]
      this.renderWall(wall.body.position[0], wall.body.position[1], wall.getWidth(), wall.getHeight())
    }

    this.renderGround(this.ground.body.position[0], this.ground.body.position[1], this.ground.getWidth(), this.ground.getHeight())
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
    // this.app.renderer.autoResize = true
    // this.app.renderer.resize(window.innerWidth, window.innerHeight)

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
    let texture = PIXI.Texture.fromImage('wall.png')

    var sprite = new PIXI.extras.TilingSprite(texture,width,height)

    sprite.anchor.set(0.5)
    sprite.position.set(x,y)

    this.app.stage.addChild(sprite)
  }

  static renderObstacle(obstacle, x, y, width, height) {
    obstacle.sprite.position.set(x,y)
  }

  static renderGround(x, y, width, height) {
    let texture = PIXI.Texture.fromImage('wall.png')

    var sprite = new PIXI.extras.TilingSprite(texture,width,height)

    sprite.anchor.set(0.5)
    sprite.position.set(x,y)

    this.app.stage.addChild(sprite)
  }

  static physicsLoop(time) {
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

    requestAnimationFrame(this.physicsLoopListener);
  }

  static runWorldPhysics() {
    requestAnimationFrame(this.physicsLoopListener)
  }

  static renderMatrixRain() {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '$', '+', '-', '*', '/', '=', '%', '"', '\'', '#', '&', '_', '(', ')', ',', '.', ';', ':', '?', '!', '\\', '|', '{', '}', '<', '>', '[', ']', '^', '~']
    let yPos = 200
    for (var i = 0; i < 1; i++) {
      let rdx = Math.floor(Math.random() * letters.length)
      let letter = letters[rdx]
      this.renderMatrixDroplet(letter, yPos)
      yPos -= 20
    }
  }

  static renderMatrixDroplet(characterText, yPos) {
    let strength = 100

    let style = new PIXI.TextStyle({
      fontFamily: "matrix-code",
      fontSize: 36,
      fill: "hsla(104, 79%, 74%, " + strength + ")",
      strokeThickness: 2,
      dropShadow: true,
      dropShadowColor: "hsl(104, 79%, 74%)",
      dropShadowBlur: 2,
      dropShadowAngle: Math.PI / 6,
      dropShadowDistance: 1,
    })

    let char = new PIXI.Text(characterText, style)
    char.position.set(200, yPos)
    window.char = char
    this.app.stage.addChild(char)
  }

  static renderObjects() {
    // this.renderMatrixRain()

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
