const Constants = require("./../constants")

class Ground {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
  }

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body({
        mass: 0, 
        position: [x,y]
    })

    this.body.entity = this


    this.shape = new p2.Plane()
    this.shape.collisionGroup = this.getCollisionGroup()
    this.shape.collisionMask  = this.getCollisionMask()

    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }

  getCollisionGroup() { return Constants.collisionGroup.Ground }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getType() { return this.constructor.name }
  
}

module.exports = Ground