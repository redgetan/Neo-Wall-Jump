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

    document.addEventListener("keyup", (event) => {
      keyPresses[event.which] = false
    })

    document.addEventListener("keydown", (event) => {
      keyPresses[event.which] = true
    })
  }

  static initPhysics() {
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
      this.moveObjects()
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
    this.app = new PIXI.Application({
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

  static physicsLoop(time) {
    const fixedTimeStep = 1 / 60
    const maxSubSteps = 10

    requestAnimationFrame(this.physicsLoopListener);

    if (typeof this.app !== "undefined") {
      for (var i = this.app.stage.children.length - 1; i >= 0; i--) {  
        this.app.stage.removeChild(this.app.stage.children[i])
      }
    }

    // Compute elapsed time since last render frame
    let deltaTime = this.lastTime ? (time - this.lastTime) / 1000 : 0;

    // Move bodies forward in time
    this.world.step(fixedTimeStep, deltaTime, maxSubSteps);

    this.postPhysicsStep()

    this.lastTime = time
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
  }

  static renderObjects() {
    this.renderCharacter(this.player.body.position[0], this.player.body.position[1], this.player.getWidth(), this.player.getHeight())

    for (var i = 0; i < this.walls.length; i++) {
      let wall = this.walls[i]
      this.renderWall(wall.body.position[0], wall.body.position[1], wall.getWidth(), wall.getHeight())
    }
  }

}

Main.run()
