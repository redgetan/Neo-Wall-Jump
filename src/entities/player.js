const Constants = require("./../constants")

class Player {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
  
    this.canJump = true
  }

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body(this.getBodyProperties(x, y))
    this.body.entity = this

    this.shape = new p2.Box({ width: this.getWidth(), height: this.getHeight() })
    this.shape.collisionGroup = this.getCollisionGroup()
    this.shape.collisionMask  = this.getCollisionMask()

    this.body.addShape(this.shape)
    this.world.addBody(this.body)
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
      mass: 1,
      damping: 0.5,
      inertia: 0.4
    }
  }

  jump() {
    if (!this.canJump) return

    this.body.velocity[1] += 500  // up

    this.canJump = false
  }

  walk(direction) {
    const prevPosition = this.body.position

    if (direction === "left") {
      prevPosition[0] -= 1
    } else if (direction === "right") {
      prevPosition[0] += 1
    }

    this.body.position = prevPosition
  }

  render() {

  }

  getWidth() { return 100 }
  getHeight() { return 100 }
}

module.exports = Player