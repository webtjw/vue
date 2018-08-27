## 开放方法

- Vue.use(plugin) => 安装插件
- Vue.mixin(mixin) => 合并（mergeOptions） mixin 和当前组件 options

## 内部方法

- mergeOptions => 用于合并构造器 options 和当前实例化传入的 options

mergeOptions 先格式化实例化传入的 options.props：数组转对象，写法驼峰化；
格式化实例化传入的 provide / inject：数组转对象，设置默认 from；
格式化实例化传入的 directives：将 method 转变为 {bind: method, update: method}

根据不同的策略合并不同的 options 属性项：
data：Vue.extend / Vue.component 时，可把 parent.data 的每一项看做默认值，vm.data 是实例值（即使是函数，Vue 也会把返回值比对合并）
life cycle hooks：全部合并，执行顺序为：extends hooks > mixin.hooks > vm.hooks
components / directives / filters：替换，优先级为 vm.assets > mixin.assets > extends assets
watch：以 vm.watch 各项为准，如果 minxins / extends / Ctor 中有同名的 watch 项，则合并；minxins / extends / Ctor 中比 vm.watch 项多出来的则被抛弃；
props / methods / inject / computed：合并 vm.xxx 到 parent.xxx，得到合并结果；
provide：同 data