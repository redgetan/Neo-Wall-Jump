class Player {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
  }

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body(this.getBodyProperties(x, y))
    this.shape = new p2.Box({ width: this.getWidth(), height: this.getHeight() })

    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }

  getBodyProperties(x, y) {
    return {
      position: [x, y],
      mass: 1,
      damping: 0.999,
      inertia: 0.4
    }
  }

  render() {

  }

  getWidth() { return 100 }
  getHeight() { return 100 }
}

module.exports = Player