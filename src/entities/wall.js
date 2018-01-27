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

    this.shape = new p2.Box({ width: this.getWidth(), height: this.getHeight() })

    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }

  getWidth() { return 150 }
  getHeight() { return 1500 }
  
}

module.exports = Wall