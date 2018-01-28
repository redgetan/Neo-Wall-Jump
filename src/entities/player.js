const Constants = require("./../constants")

class Player {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
    this.initController()

    this.spriteWidth = 40
    this.spriteHeight = 60
    this.spriteSheetRowCount = 10

    this.textures = {}
  
    this.maxHeightReached = 0
    this.canJump = true

    this.left = 0
    this.right = 0

    this.initSprite()
  }

  initSprite() {
    this.spriteSheetImage  = PIXI.BaseTexture.fromImage("neo_black_spritesheet.png")
    this.sprite = new PIXI.extras.AnimatedSprite(this.getWalkRightTextures())
    this.sprite.animationSpeed = 0.2
    this.sprite.anchor.set(0.5)
    this.sprite.scale.y = -1
  }

  getWalkRightTextures() {
    if (!this.textures["walk_right"]) {
      this.textures["walk_right"] = this.extractTextures(0, 4)
    }

    return this.textures["walk_right"]
  }

  getWalkLeftTextures() {
    if (!this.textures["walk_left"]) {
      this.textures["walk_left"] = this.extractTextures(5, 9, { isReversed: true })
    }

    return this.textures["walk_left"]
  }

  getJumpLeftTextures() {
    if (!this.textures["jump_left"]) {
      this.textures["jump_left"] = this.extractTextures(10, 18, { isReversed: true })
    }

    return this.textures["jump_left"]
  }

  getJumpRightTextures() {
    if (!this.textures["jump_right"]) {
      this.textures["jump_right"] = this.extractTextures(20, 28)
    }

    return this.textures["jump_right"]
  }

  extractTextures(start, stop, isReversed) {
    let textures = []

    for (var i = start; i <= stop; i++) {
      let row = Math.floor(i / this.spriteSheetRowCount)
      let col = i % this.spriteSheetRowCount

      let x = col * this.spriteWidth
      let y = row * this.spriteHeight

      let rectange = new PIXI.Rectangle(x, y, this.spriteWidth, this.spriteHeight)
      let texture = new PIXI.Texture(this.spriteSheetImage, rectange)

      textures.push(texture)
    }

    if (isReversed) {
      textures.reverse()
    }

    return textures
  }

  initController() {
    this.controller = new p2.KinematicCharacterController({
      world: this.world,
      body: this.body,
      moveSpeed: 400,
      collisionMask: this.getCollisionMask(),
      velocityXSmoothing: 0.0001,
      timeToJumpApex: 0.4,
      skinWidth: 0.1,
      minJumpHeight: 50,
      maxJumpHeight: 80,
      wallSlideSpeedMax: 10000,
      wallJumpClimb: [800,800],
      wallJumpOff: [800, 800],
      wallLeap: [800,800]
    })
  }

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body(this.getBodyProperties(x, y))
    this.body.entity = this

    this.shape = new p2.Box({ width: this.getWidth(), height: this.getHeight() })
    this.shape.collisionGroup = this.getCollisionGroup()
    this.shape.collisionMask  = this.getCollisionMask()

    this.body.addShape(this.shape)
    // this.world.addBody(this.body)
  }

  allowJump() {
    this.canJump = true
  }

  getCollisionGroup() { return Constants.collisionGroup.Player }
  getCollisionMask()  { return Constants.collisionGroup.Wall | Constants.collisionGroup.Ground }

  getType() { return this.constructor.name }

  getBodyProperties(x, y) {
    return {
      position: [x, y],
      mass: 0,
      damping: 0,
      type: p2.Body.KINEMATIC
      // inertia: 0.4
    }
  }

  update(deltaTime) {
    this.controller.update(deltaTime)

    this.maxHeightReached = Math.max(this.maxHeightReached, Math.floor(this.body.position[1]))

    // console.log("state: " + this.state + " ")
    if (this.controller.input[0] > 0 && this.state !== "walk_right" && this.controller.collisions.below === true) {
      this.state = "walk_right"
      // walk right
      this.sprite.textures = this.getWalkRightTextures()
      this.sprite.play()
    } else if (this.controller.input[0] < 0 && this.state !== "walk_left" && this.controller.collisions.below === true) {
      this.state = "walk_left"
      // walk right
      // walk left
      this.sprite.textures = this.getWalkLeftTextures()
      this.sprite.play()
    } else if (this.controller.collisions.below === false && this.state !== "jump") {
      this.state = "jump"

      if (this.controller.faceDir === 1) {
        this.sprite.textures = this.getJumpRightTextures()
      } else {
        this.sprite.textures = this.getJumpLeftTextures()
      }

      this.sprite.play()
    } else if (this.controller.input[0] === 0 && this.state !== "stop" && this.controller.collisions.below === true) {
      this.state = "stop"
      if (this.controller.faceDir === 1) {
        this.sprite.textures = this.getWalkRightTextures()
      } else {
        this.sprite.textures = this.getWalkLeftTextures()
      }
      this.sprite.gotoAndStop(0)
    }

  }

  getMaxHeightReached() { return this.maxHeightReached }

  jump() {
    this.controller.setJumpKeyState(true)

  }

  stopJump() {
    this.controller.setJumpKeyState(false)
  }

  walk(direction) {
    const prevPosition = this.body.position

    if (direction === "left") {
      this.body.velocity[0] -= 30
    } else if (direction === "right") {
      this.body.velocity[0] += 30
    }

    this.body.position = prevPosition
  }

  render() {

  }

  getWidth() { return 40 }
  getHeight() { return 60 }
}

module.exports = Player