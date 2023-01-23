import { createDep } from "./dep.js"
import { recordEffectScope } from "./effectScope.js"

let activeEffect = undefined
let shouldTrack = false

export class ReactiveEffect {

  parent = undefined
  active = true
  deps = []
  onStop = undefined

  constructor(fn, scheduler, scope) {
    this.fn = fn
    this.scheduler = scheduler
    recordEffectScope(this, scope)
  }

  run() {

    // 执行 fn  但是不收集依赖
    if (!this.active) {
      return this.fn();
    }
    const lastShouldTrack = shouldTrack
    this.parent = activeEffect
    shouldTrack = true
    activeEffect = this
   

    try {
      return this.fn()
    } finally {
      shouldTrack = lastShouldTrack
      activeEffect = this.parent
      this.parent = undefined
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
    }
    this.active = false
  }

}

function cleanupEffect(effect) {
  // 找到所有依赖这个 effect 的响应式对象
  // 从这些响应式对象里面把 effect 给删除掉
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });

  effect.deps.length = 0;
}

export function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn)

  if (options.scope) recordEffectScope(_effect, options.scope)

  if (!options.lazy) {
    _effect.run()
  }

  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

const targetMap = new WeakMap()

export function track(target, key) {

  if (!shouldTrack || !activeEffect) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = createDep()
    depsMap.set(key, dep)
  }

  trackEffects(dep)
}

export function trackEffects(dep) {
  if (!dep.has(activeEffect)) {
    // 双向收集
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

export function trigger(target, key) {

  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  
  if (dep) {
    triggerEffects(dep)
  }
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function canTrack() {
  return shouldTrack && activeEffect
}
