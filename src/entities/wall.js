const Constants = require("./../constants")
const BaseEntity = require("./base_entity")

class Wall extends BaseEntity {

  getSpritePath() {
    return './assets/images/wall.png'
  }

  getCollisionGroup() { return Constants.collisionGroup.Wall }
  getCollisionMask()  { return Constants.collisionGroup.Player }

  getWidth() { return 128 }
  getHeight() { return 5000 }
  
}

module.exports = Wall