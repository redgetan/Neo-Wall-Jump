class BaseEntity {
  constructor(game, x, y) {
    this.stage = game.app.stage
    this.world = game.world
    this.textures = {}

    this.initPhysics(x,y)
    this.initSprite(x,y)
  } 

  initPhysics(x,y) {
    // Create an infinite ground plane body
    this.body = new p2.Body(this.getBodyProperties(x, y))

    this.body.entity = this


    this.shape = this.getShape()
    this.shape.collisionGroup = this.getCollisionGroup()
    this.shape.collisionMask  = this.getCollisionMask()

    this.body.addShape(this.shape)
    this.world.addBody(this.body)
  }

  getBodyProperties(x, y) {
    return {
        mass: 0, 
        position: [x,y]
    }
  }

  getShape() {
    return new p2.Box({ width: this.getWidth(), height: this.getHeight() })
  }

  initSprite() {
    let texture = PIXI.Texture.fromImage(this.getSpritePath())

    this.sprite = new PIXI.extras.TilingSprite(texture, this.getWidth(), this.getHeight())

    this.sprite.anchor.set(0.5)
    this.sprite.position.set(this.body.position[0], this.body.position[1])
    this.sprite.scale.y = -1

    this.stage.addChild(this.sprite)
  }

}

module.exports = BaseEntity