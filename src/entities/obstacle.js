const Constants = require("./../constants")

class Obstacle {
  constructor(world, x, y) {
    this.world = world
    this.initPhysics(x,y)
    this.initSprite(x,y)
  }

  initSprite(x, y) {
    let texture = PIXI.Texture.fromImage('obstacle.png')

    this.sprite = new PIXI.extras.TilingSprite(texture,this.getWidth(),this.getHeight())

    this.sprite.scale.y = -1
    this.sprite.anchor.set(0.5)
    this.sprite.position.set(x,y)
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

  getCollisionGroup() { return Constants.collisionGroup.Obstacle }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getType() { return this.constructor.name }

  getWidth() { return 128 }
  getHeight() { return 128 }
  
}

module.exports = Obstacle