const Constants = require("./../constants")

class Player {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
    this.initController()
  
    this.canJump = true
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
      wallJumpClimb: [800,800],
      wallJumpClimb: [800,800],
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

    // const deltaTime = this.world.lastTimeStep
    // this.body.velocity[1] += this.world.gravity[1] * deltaTime;
  }

  jump() {
    this.controller.setJumpKeyState(true)

    // console.log("attempt jump: canJump - " + this.canJump)
    // if (!this.canJump) return

    // this.body.velocity[1] += 500  // up

    // this.canJump = false
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

  getWidth() { return 100 }
  getHeight() { return 100 }
}

module.exports = Player