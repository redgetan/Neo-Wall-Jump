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

    this.shape = new p2.Plane()
    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }
  
}

module.exports = Ground