const Constants = require("./../constants")
const BaseEntity = require("./base_entity")

class Player extends BaseEntity {
  constructor(game, x, y) {
    super(game, x, y)

    this.initController()

    this.maxHeightReached = 0
    this.canJump = true

    this.left = 0
    this.right = 0

    this.initSound()
  }

  initSound() {
    this.jumpSound = new Howl({
      src: ['./assets/audio/jump.mp3']
    })
  }

  getSpritePath() {
    return "./assets/images/neo_black_spritesheet.png" 
  }

  getSpriteSheetRowCount() {
    return 10
  }

  initSprite() {
    this.spriteSheetImage  = PIXI.BaseTexture.fromImage(this.getSpritePath())
    this.sprite = new PIXI.extras.AnimatedSprite(this.getWalkRightTextures())
    this.sprite.animationSpeed = 0.15
    this.sprite.anchor.set(0.5)
    this.sprite.scale.y = -1

    this.stage.addChild(this.sprite)
  }

  getWalkRightTextures() {
    if (!this.textures["walk_right"]) {
      this.textures["walk_right"] = this.extractTextures(0, 4)
    }

    this.currentTexture = "walk_right"

    return this.textures["walk_right"]
  }

  getWalkLeftTextures() {
    if (!this.textures["walk_left"]) {
      this.textures["walk_left"] = this.extractTextures(5, 9, { isReversed: true })
    }

    this.currentTexture = "walk_left"

    return this.textures["walk_left"]
  }

  getJumpLeftTextures() {
    if (!this.textures["jump_left"]) {
      this.textures["jump_left"] = this.extractTextures(10, 18, { isReversed: true })
    }

    this.currentTexture = "jump_left"

    return this.textures["jump_left"]
  }

  getJumpRightTextures() {
    if (!this.textures["jump_right"]) {
      this.textures["jump_right"] = this.extractTextures(20, 28)
    }

    this.currentTexture = "jump_right"

    return this.textures["jump_right"]
  }

  extractTextures(start, stop, isReversed) {
    let textures = []

    for (var i = start; i <= stop; i++) {
      let row = Math.floor(i / this.getSpriteSheetRowCount())
      let col = i % this.getSpriteSheetRowCount()

      let x = col * this.getWidth()
      let y = row * this.getHeight()

      let rectange = new PIXI.Rectangle(x, y, this.getWidth(), this.getHeight())
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
      minJumpHeight: 100,
      maxJumpHeight: 170,
      wallSlideSpeedMax: 10000,
      wallJumpClimb: [800,800],
      wallJumpOff: [800, 800],
      wallLeap: [800,800]
    })

    this.controller.onJumpOffWall = this.onJumpOffWall.bind(this)
    this.controller.shouldAllowWallJump = this.shouldAllowWallJump.bind(this)
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

  getCollisionGroup() { return Constants.collisionGroup.Player }
  getCollisionMask()  { return Constants.collisionGroup.Wall | Constants.collisionGroup.Ground | Constants.collisionGroup.Obstacle }

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

      if (this.controller.collisions.faceDir === 1) {
        this.sprite.textures = this.getJumpRightTextures()
      } else {
        this.sprite.textures = this.getJumpLeftTextures()
      }

      this.sprite.play()
    } else if (this.controller.input[0] === 0 && this.state !== "stop" && this.controller.collisions.below === true) {
      this.state = "stop"
      if (this.controller.collisions.faceDir === 1) {
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

  onJumpOffWall() {
    this.jumpSound.play()
  }

  shouldAllowWallJump() {
    const isJumping = this.currentTexture === "jump_left" || this.currentTexture === "jump_right"
    const isCorrectFrame = this.sprite.currentFrame === 8 || this.sprite.currentFrame === 7 || this.sprite.currentFrame === 0
    return isJumping && isCorrectFrame
  }

  stopJump() {
    this.controller.setJumpKeyState(false)
  }

  getWidth() { return 40 }
  getHeight() { return 60 }
}

module.exports = Player