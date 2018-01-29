const Constants = require("./../constants")
const BaseEntity = require("./base_entity")

class Ground extends BaseEntity {

  getSpritePath() {
    return './assets/images/wall.png'
  }

  getCollisionGroup() { return Constants.collisionGroup.Ground }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getWidth() { return 1500 }
  getHeight() { return 192 }
  
}

module.exports = Ground