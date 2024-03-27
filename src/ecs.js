// =============================================================================
// Entity
// =============================================================================

/**
 * @typedef {{}} Entity
 */

/**
 * @returns {Entity}
 */
function createEntity() {
  return Object.freeze(Object.create(null))
}

// =============================================================================
// Component
// =============================================================================

/**
 * @template {import('./validate.js').TypeChecker<any>} TState
 * @typedef {object} Component
 * @property {TState} state
 */

/**
 * @template TComponentType
 * @typedef {TComponentType extends Component<import('./validate.js').TypeChecker<infer X>> ? X : never} ComponentType
 */

/**
 * @template {import('./validate.js').TypeChecker<any>} TState
 * @param {TState} state
 * @returns {Component<TState>}
 */
export function createComponent(state) {
  return Object.freeze({ state })
}

// =============================================================================
// System
// =============================================================================

/**
 * @template {import('./validate.js').TypeChecker<any>} TState
 * @template {{[key: string]: Component<any>[]}} TQueries
 * @typedef {object} System
 * @property {TState} state
 * @property {TQueries} queries
 * @property {(state: import('./validate.js').TypeCheckerType<TState>, delta: number, queries: {[Property in keyof TQueries]: Set<Entity>}) => void} execute
 * @property {(state: import('./validate.js').TypeCheckerType<TState>) => (() => void)} [init]
 */

/**
 * @template TSystemState
 * @typedef {TSystemState extends System<import('./validate.js').TypeChecker<infer X>, any> ? X : never} SystemState
 */

/**
 * @template {import('./validate.js').TypeChecker<any>} TState
 * @template {{[key: string]: Component<any>[]}} TQueries
 * @param {TState} state
 * @param {(state: import('./validate.js').TypeCheckerType<TState>, delta: number, queries: {[Property in keyof TQueries]: Set<Entity>}) => void} execute
 * @param {TQueries} queries
 * @param {(state: import('./validate.js').TypeCheckerType<TState>) => (() => void)} [init]
 * @returns {System<TState, TQueries>}
 */
export function createSystem(state, queries, execute, init) {
  return Object.freeze({ state, queries, execute, init })
}

// =============================================================================
// World
// =============================================================================

/**
 * @typedef {object} EntityState
 * @property {boolean} remove
 * @property {Map<Component<any>, any>} components
 * @property {Set<Set<Entity>>} addedTo
 * @property {(entity: Entity, component: Component<any>) => void} onAddComponent
 */

/** @type {WeakMap<Entity, EntityState>} */
const entityState = new WeakMap()

/**
 * @template {Component<any>} TComponent
 * @param {Entity} entity
 * @param {TComponent} component
 * @returns {ComponentType<TComponent>}
 */
export function getComponent(entity, component) {
  const components = entityState.get(entity)?.components
  if (!components?.has(component))
    throw new ReferenceError('entity does not have component')
  return components.get(component)
}

/**
 * @template {Component<any>} TComponent
 * @param {Entity} entity
 * @param {TComponent} component
 * @param {ComponentType<TComponent>} componentState
 * @returns {Entity}
 */
export function addComponent(entity, component, componentState) {
  const state = entityState.get(entity)
  if (state && !state.remove) {
    state.components.set(component, componentState)
    state.onAddComponent(entity, component)
  }
  return entity
}

/**
 * @param {Set<Entity>} query
 * @param {Entity} entity
 */
export function isAdded(query, entity) {
  return entityState.get(entity)?.addedTo.has(query) ?? false
}

/**
 * @param {Set<Entity>} query
 * @param {Entity} entity
 */
export function isRemoved(query, entity) {
  return entityState.get(entity)?.remove ?? true
}

/**
 * @param {Entity} entity
 */
export function removeEntity(entity) {
  const state = entityState.get(entity)
  if (state) {
    state.remove = true
  }
}

/**
 * @typedef {object} SystemInstance
 * @property {System<import('./validate.js').TypeChecker<any>, {[key: string]: Component<any>[]}>} system
 * @property {any} state
 * @property {{key: string, query: EntityQuery, entities: Set<Entity>}[]} queries
 */

/**
 * @typedef {ReturnType<createEntityQuery>} EntityQuery
 */

/**
 * @param {Component<any>[]} components
 */
function createEntityQuery(components) {
  /**
   * @param {Entity} entity
   */
  return (entity) => {
    const myComponents = entityState.get(entity)?.components
    if (!myComponents) return false
    return components.every((component) => myComponents.has(component))
  }
}

/** @typedef {ReturnType<createWorld>} World */

export function createWorld() {
  /** @type {Set<Entity>} */
  const entities = new Set()
  /** @type {SystemInstance[]} */
  const systems = []

  /**
   * @param {Entity} entity
   * @param {Component<any>} component
   */
  function onAddComponent(entity, component) {
    systems.forEach((system) => {
      system.queries.forEach((query) => {
        if (!query.entities.has(entity) && query.query(entity)) {
          entityState.get(entity)?.addedTo.add(query.entities)
          query.entities.add(entity)
        }
      })
    })
  }

  const world = Object.freeze({
    /**
     * @template {System<any, any>} TSystem
     * @param {TSystem} system
     * @param {SystemState<TSystem>} state
     */
    registerSystem(system, state) {
      /** @type {SystemInstance} */
      const systemInstance = {
        system,
        state,
        queries: Object.entries(system.queries).map(([key, components]) => {
          const query = createEntityQuery(components)
          const queryEntities = new Set(
            Array.from(entities).filter((entity) => query(entity))
          )
          queryEntities.forEach((entity) => {
            entityState.get(entity)?.addedTo.add(queryEntities)
          })
          return { key, query, entities: queryEntities }
        }),
      }
      system.init?.(state)
      systems.push(systemInstance)
      return world
    },
    createEntity() {
      const entity = createEntity()
      /** @type {Map<Component<any>, any>} */
      const components = new Map()
      /** @type {EntityState} */
      const state = {
        remove: false,
        addedTo: new Set(),
        components,
        onAddComponent,
      }
      entities.add(entity)
      entityState.set(entity, state)
      return entity
    },
    /**
     * @param {number} delta
     */
    execute(delta) {
      systems.forEach((system) => {
        const queries = Object.fromEntries(
          system.queries.map(({ key, entities }) => [key, entities])
        )
        system.system.execute(system.state, delta, queries)
      })

      const entitiesToRemove = new Set()
      entities.forEach((entity) => {
        const state = entityState.get(entity)
        if (state) {
          state.addedTo.clear()
          if (state.remove) {
            entityState.delete(entity)
            entitiesToRemove.add(entity)
            entities.delete(entity)
          }
        }
      })
      if (entitiesToRemove.size) {
        systems.forEach((system) => {
          system.queries.forEach((query) => {
            entitiesToRemove.forEach((entity) => query.entities.delete(entity))
          })
        })
      }
    },
  })
  return world
}
