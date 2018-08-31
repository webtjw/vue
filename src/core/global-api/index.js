/* @flow */

import config from '../config'
import { initUse } from './use'
import { initMixin } from './mixin'
import { initExtend } from './extend'
import { initAssetRegisters } from './assets'
import { set, del } from '../observer/index'
import { ASSET_TYPES } from 'shared/constants'
import builtInComponents from '../components/index'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index'

export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef) // 只读属性，指向 Vue 的配置

  // 不懂就别瞎用的非公开 API
  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn, // (message, vm)
    extend, // (to, from) 把 from 的属性覆盖到 to
    mergeOptions, // 合并构造器迭代 parent.options 和 当前 options
    defineReactive // 定义一个响应式属性
  }

  Vue.set = set // 设置响应式属性
  Vue.delete = del // 删除 xxx
  Vue.nextTick = nextTick // 当前 DOM 更新完成后执行队列的入列函数

  Vue.options = Object.create(null) // Vue.options Vue.options Vue.options 最顶级的构造函数的 options
  // component / directive / filter
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  /**
   * 到这里 Vue.potions = {
   *  components: {KeepAlive},
   *  directives: {},
   *  filters: {},
   *  _base: Vue
   * }
   */

  initUse(Vue) // Vue.use
  initMixin(Vue) // Vue.mixin
  initExtend(Vue) // Vue.extend
  initAssetRegisters(Vue) // 全局注册器 Vue.component / Vue.filter / Vue.directive
}
