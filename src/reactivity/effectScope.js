
let activeEffectScope

class EffectScope {

  _active = true
  effects = []
  cleanups = []

  constructor() {}

  get active() {
    return this._active
  }

  run(fn) {
    if (this._active) {
      const lastEffectScope = activeEffectScope
      try {
        activeEffectScope = this
        return fn()
      } finally {
        activeEffectScope = lastEffectScope
      }
    }
  }

  stop() {
    if (this._active) {
      for (let i = 0; i < this.effects.length; i++) {
        this.effects[i].stop()
      }
      for (let i = 0; i < this.cleanups.length; i++) {
        this.cleanups[i]()
      }
      this._active = false
    }
  }
}

export function effectScope() {
  return new EffectScope()
}

export function recordEffectScope(effect, scope = activeEffectScope) {
  if (scope && scope.active) {
    scope.effects.push(effect)
  }
}

export function getCurrentScope() {
  return activeEffectScope
}

export function onScopeDispose(fn) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn)
  } else {
    console.warn(`onScopeDispose() is called when there is no active effect scope to be associated with.`)
  }
}