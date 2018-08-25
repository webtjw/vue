/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // new Vue 时的传参对象：options
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // unique id，用于标记每一个 Vue 实例
    vm._uid = uid++

    // 用于开启记录组件在浏览器中的渲染表现（chrome 中的 performance）
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // _isVue 是用于防止实例被设置为响应式数据（全局搜索 _isVue 可在 observer 中找到）
    // a flag to avoid this being observed
    vm._isVue = true
    // 合并参数
    // merge options
    // TODO【待验证】当组件拥有子组件时，options._isComponent 才为 true
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      // 实例的 options
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    // 【dev】开发环境下通过设置 vm._renderProxy 对的实例 vm 属性访问做检查，不存在的属性 / 下划线"_"开头的属性 / 非通用全局属性都不能访问
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm) // 设置属性 $parent / $root / $children /$refs
    initEvents(vm) // 为组件更新事件处理器
    initRender(vm) // runtime 下把子节点模板编译为 slots 对象
    callHook(vm, 'beforeCreate')
    // TODO inject 的内容是？？
    initInjections(vm) // resolve injections before data/props
    initState(vm) // 将 props，data 设为响应式数据，methods 校验 + 绑定 context + 绑定在 vm 上
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// 用于获取构造类 Ctor 的 options
export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // Ctor.super 说明该构造类是通过 Vue.extend 得到的子类（全局搜索 super 可知）
  if (Ctor.super) {
    // TODO 通过怎样的方式注入 options 更改呢？？
    // 获取父类实际的 options（因为有可能在后续被注入一些 options 导致更改）
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 这个是在子类中缓存的父类的 options
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // 当父类缓存的 options 和实际的 options 不一致时，说明父类的 options 是被注入更改了，需要及时更新缓存在子类中的父类 options
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // 不仅是父类，类 Ctor 自身的 options 也有会被注入修改，因此也需要更新
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions) // 更新
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions) // 子类拓展的 options 合并到 父类 options 上形成子类的 options
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const extended = Ctor.extendOptions // extendOptions 通过 Vue.extend 传递过来的子类的参数对象
  const sealed = Ctor.sealedOptions // Ctor.options 的 shallow copy 版本
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

function dedupe (latest, extended, sealed) {
  // compare latest and sealed to ensure lifecycle hooks won't be duplicated
  // between merges
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended : [extended]
    for (let i = 0; i < latest.length; i++) {
      // push original options and not sealed options to exclude duplicated options
      if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}
