import { ReactiveEffect } from "../reactivity/effect.js"
import { isReactive } from "../reactivity/reactive.js"
import { isRef } from "../reactivity/ref.js"
import { hasChanged, isFunction } from "../utils/index.js"

const INITIAL_WATCHER_VALUE = {}

export function watchEffect(effect) {
  return doWatch(effect, null)
}

export function watch(source, cb, options) {
  return doWatch(source, cb, options)
}

export function doWatch(source, cb, options = {}) {

  let getter

  if (isRef(source)) {
    getter = () => source.value
  } else if (isReactive(source)) {
    getter = () => source
    options.deep = true
  } else if (isFunction(source)) {
    
    if (cb) {
      // watch
      getter = () => source()    
    } else {
      // watchEffect
      getter = () => {
        if (cleanup) {
          cleanup()
        }
        source(onCleanup)
      }
    }
  }

 
  let cleanup
  const onCleanup = (fn) => {
    cleanup = effect.onStop = () => {
      fn()
    }
  }

  let oldValue = INITIAL_WATCHER_VALUE

  const job = () => {
    if (!effect.active) return;
    if (cb) {
      const newValue = effect.run()
      if (options.deep || hasChanged(newValue, oldValue)) {
        if (cleanup) {
          cleanup()
        }
        cb(newValue, oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue, onCleanup)
      }
    } else {
      effect.run()
    }
  }

  const effect = new ReactiveEffect(getter, job)

  if (cb) {
    if (options.immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  } else {
    effect.run()
  }

  const unwatch = () => {
    effect.stop()
  }

  return unwatch
}