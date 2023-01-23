import { effect } from './reactivity/effect.js'
import { reactive } from './reactivity/reactive.js'
import { ref, toRefs } from './reactivity/ref.js'
import { computed } from './reactivity/computed.js'
import { watchEffect, watch } from './runtime-core/apiWatch.js'


const count = ref(0)

const stop = watchEffect((onCleanup) => {
    onCleanup(() => {
        // count.value发生变化时触发,首次执行时不触发，
        // 可用来注册清理回调。清理回调会在该副作用下一次执行前被调用，可以用来清理无效的副作用，例如等待中的异步请求
        console.log('onCleanup')
    })    
    console.log(count.value)
}, /* options */) // 可选的options配置参数，用来调整副作用的刷新时机或调试副作用的依赖，主要是设置侦听器将在组件渲染之前执行，还是同步还是之后执行的，本文由于只讲响应式原理，不涉及渲染相关所以就不实现了。

// 首次打印 -> 输出 0

count.value++
// 打印 -> oncleanup
// 打印 -> 输出 1

// 当不再需要此侦听器时,可以停止侦听器
stop()

count.value++
// 不在打印