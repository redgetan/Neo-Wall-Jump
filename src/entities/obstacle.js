const Constants = require("./../constants")
const BaseEntity = require("./base_entity")

class Obstacle extends BaseEntity {

  getSpritePath() {
    return './assets/images/obstacle.png'
  }

  getCollisionGroup() { return Constants.collisionGroup.Obstacle }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getWidth() { return 128 }
  getHeight() { return 128 }
  
}

module.exports = Obstacle