import * as PIXI from 'pixi.js'
import * as ecs from '@ksmithut/ecs'
import v from '@ksmithut/ecs/validate'

export const positionComponent = ecs.createComponent(
  v.object({
    x: v.number(),
    y: v.number(),
  })
)

export const velocityComponent = ecs.createComponent(
  v.object({
    x: v.number(),
    y: v.number(),
  })
)

export const frictionComponent = ecs.createComponent(v.number())

export const collidableComponent = ecs.createComponent(v.null())

export const playerControlledComponent = ecs.createComponent(v.undefined())
export const possessedByPlayerComponent = ecs.createComponent(v.undefined())

export const graphicsComponent = ecs.createComponent(
  v.object({
    pixiObject: v.or(v.instanceOf(PIXI.Graphics), v.instanceOf(PIXI.Sprite)),
  })
)

export const itemComponent = ecs.createComponent(v.undefined())

export const inventoryComponent = ecs.createComponent(
  v.object({
    maxItems: v.number(),
    items: v.array(v.object({})),
  })
)
