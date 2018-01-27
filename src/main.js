const Player = require("./entities/player")
const Wall   = require("./entities/wall")
const Ground = require("./entities/ground")
const Constants = require("./constants")

class Main {

  static run() {
    this.physicsLoopListener = this.physicsLoop.bind(this)

    this.initPhysics()
    this.initRenderer()
    this.initControls()
  }

  static initControls() {
    window.keyPresses = {}

    this.left = 0
    this.right = 0

    document.addEventListener("keydown", (event) => {
      // keyPresses[event.which] = false


      switch(event.keyCode){
        case 39: this.right = 1; break; // right key
        case 38: this.player.jump(); break; // up key
        case 37: this.left = 1; break; // left key
        default:
      }

      this.player.controller.input[0] = this.right - this.left
    })

    document.addEventListener("keyup", (event) => {
      // keyPresses[event.which] = true

      switch(event.keyCode){
        case 39: this.right = 0; break; // right key
        case 38: this.player.stopJump(); break; // up key
        case 37: this.left = 0; break; // left key
        default:
      }

      this.player.controller.input[0] = this.right - this.left
    })
  }

  static initPhysics() {
    console.log("initPhysics")
    window.world = this.world = new p2.World({
        gravity: [0, -1500]
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
    }.bind(this))

    this.world.on('postStep', function(evt){
      this.player.update(this.world.lastTimeStep)
    }.bind(this))



    this.initEntities()
    this.runWorldPhysics()
  }

  static onPlayerWallCollide() {
    this.player.allowJump()
  }

  static onPlayerGroundCollide() {
    this.player.allowJump()
  }

  static initEntities() {
    window.player = this.player = new Player(this.world, 150, 250)
    this.ground = new Ground(this.world, 0, 0)
    this.walls  = [
      new Wall(this.world, 30,0),
      new Wall(this.world, window.innerWidth - 30, 0)
    ]
  }

  static initRenderer() {
    window.app = this.app = new PIXI.Application({
      forceCanvas: true
    })

    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()){
      type = "canvas"
    }

    PIXI.utils.sayHello(type)

    this.app.renderer.view.style.position = "absolute"
    this.app.renderer.view.style.display = "block"
    this.app.renderer.autoResize = true
    this.app.renderer.resize(window.innerWidth, window.innerHeight)

    this.app.stage.position.y = this.app.renderer.height / this.app.renderer.resolution
    this.app.stage.scale.y = -1

    //Add the canvas that Pixi automatically created for you to the HTML document
    document.body.appendChild(this.app.view)
  }


  static renderCharacter(x, y, width, height) {
    let rectangle = new PIXI.Graphics()
    rectangle.beginFill(0x66CCFF)
    rectangle.lineStyle(4, 0xFF3300, 1)
    
    const lowerLeftX = x - width/2
    const lowerLeftY = y - height/2

    rectangle.drawRect(lowerLeftX, lowerLeftY, width, height)
    rectangle.endFill()
    this.app.stage.addChild(rectangle)
  }

  static renderWall(x, y, width, height) {
    let rectangle = new PIXI.Graphics()
    rectangle.beginFill(0x00FF00)
    // rectangle.lineStyle(4, 0xFF3300, 1)

    const lowerLeftX = x - width/2
    const lowerLeftY = y - height/2

    rectangle.drawRect(lowerLeftX, lowerLeftY, width, height)
    rectangle.endFill()
    this.app.stage.addChild(rectangle)
  }

  static renderGround(x, y, width, height) {
    let rectangle = new PIXI.Graphics()
    rectangle.beginFill(0x0000FF)
    // rectangle.lineStyle(4, 0xFF3300, 1)

    const lowerLeftX = x - width/2
    const lowerLeftY = y - height/2

    rectangle.drawRect(lowerLeftX, lowerLeftY, width, height)
    rectangle.endFill()
    this.app.stage.addChild(rectangle)
  }

  static physicsLoop(time) {
    const fixedTimeStep = 1 / 60
    const maxSubSteps = 10

    if (typeof this.app !== "undefined") {
      for (var i = this.app.stage.children.length - 1; i >= 0; i--) {  
        this.app.stage.removeChild(this.app.stage.children[i])
      }
    }

    // Compute elapsed time since last render frame
    let deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;

    // this.moveObjects()

    // Move bodies forward in time
    this.world.step(fixedTimeStep, deltaTime, maxSubSteps);

    this.postPhysicsStep()

    this.lastTime = time

    requestAnimationFrame(this.physicsLoopListener);
  }

  static postPhysicsStep() {
    this.renderObjects()
  }

  static runWorldPhysics() {
    requestAnimationFrame(this.physicsLoopListener)
  }

  static moveObjects() {
    if (keyPresses[37]) this.player.walk("left")  
    if (keyPresses[39]) this.player.walk("right")
    if (keyPresses[38]) this.player.jump() 

    // this.player.update()
  }

  static renderMatrixRain() {
    let letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '$', '+', '-', '*', '/', '=', '%', '"', '\'', '#', '&', '_', '(', ')', ',', '.', ';', ':', '?', '!', '\\', '|', '{', '}', '<', '>', '[', ']', '^', '~']
    let yPos = 200
    for (var i = 0; i < 10; i++) {
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

    this.renderCharacter(this.player.body.position[0], this.player.body.position[1], this.player.getWidth(), this.player.getHeight())

    for (var i = 0; i < this.walls.length; i++) {
      let wall = this.walls[i]
      this.renderWall(wall.body.position[0], wall.body.position[1], wall.getWidth(), wall.getHeight())
    }

    this.renderGround(this.ground.body.position[0], this.ground.body.position[1], this.ground.getWidth(), this.ground.getHeight())
    this.updateDebugLog()
  }

  static updateDebugLog() {
    const player = window.player.controller

    debug.innerHTML = [
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
