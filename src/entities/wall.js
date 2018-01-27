const Constants = require("./../constants")

class Wall {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
  }

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body({
        mass: 0, // Setting mass to 0 makes it static,
        position: [x,y]
    })
    this.body.entity = this


    this.shape = new p2.Box({ width: this.getWidth(), height: this.getHeight() })
    this.shape.collisionGroup = this.getCollisionGroup()
    this.shape.collisionMask  = this.getCollisionMask()


    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }

  getCollisionGroup() { return Constants.collisionGroup.Wall }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getType() { return this.constructor.name }

  getWidth() { return 150 }
  getHeight() { return 5000 }
  
}

module.exports = Wall