import applyMixin from './mixin';
import { forEach } from './util';
import ModuleCollection from './module/module-collection';
let Vue;

function getState(store, path) {
  return path.reduce((newState, current) => {
    return newState[current];
  }, store.state);
}
// 递归安装模块并且格式化vuex的state，mutations，actions，getters
function installModule(store, rootState, path, module) {
  // 注册事件时，需要注册到对应的命名空间中 path就是所有的路径 根据path算出一个空间来
  let namespace = store._modules.getNamespace(path);
  if (path.length > 0) {
    // 说明是子模块的循环，需要将子模块的状态定义到根模块上
    // 又要开始找爸爸
    let parent = path.slice(0, -1).reduce((memo, current) => {
      return memo[current];
    }, rootState);

    // 这个api可以新增属性，如果本身对象不是响应式，则会直接复制
    // Vue.set会区分是否是响应式数据
    // Vue.set(parent, path[path.length - 1], module.state);

    store._withCommitting(() => {
      Vue.set(parent, path[path.length - 1], module.state);
    });
  }
  module.forEachMutation((mutation, type) => {
    // changeAge:[fn,fn,fn] 发布订阅
    store._mutations[namespace + type] =
      store._mutations[namespace + type] || [];
    store._mutations[namespace + type].push((payload) => {
      // 内部可能会替换状态，这里如果一直使用module.state，可能是老的状态
      // mutation.call(store, module.state, payload);
      // mutation.call(store, getState(store, path), payload);
      store._withCommitting(() => {
        mutation.call(store, getState(store, path), payload);
      });
      // 调用subscribe订阅的时间
      store._subscribers.forEach((sub) => sub({ mutation, type }, store.state));
    });
  });
  module.forEachAction((action, type) => {
    store._actions[namespace + type] = store._actions[namespace + type] || [];
    store._actions[namespace + type].push((payload) => {
      action.call(store, store, payload);
    });
  });
  module.forEachGetters((getter, key) => {
    // getters重名会覆盖
    store._wrappedGetters[namespace + key] = function () {
      // return getter(module.state);
      return getter(getState(store, path));
    };
  });
  module.forEachChild((child, key) => {
    installModule(store, rootState, path.concat(key), child);
  });
}

function resetStoreVm(store, state) {
  const wrappedGetters = store._wrappedGetters;
  let oldVm = store._vm;
  let computed = {};
  store.getters = {};
  // 让getters定义在store上
  forEach(wrappedGetters, (fn, key) => {
    // 通过computed实现缓存效果
    computed[key] = function () {
      return fn();
    };
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key],
    });
  });
  // 实现让状态变成响应式
  store._vm = new Vue({
    data: {
      $$state: state,
    },
    computed,
  });
  if (store.strict) {
    // 只要状态一变化，会立即执行，在状态变化后同步执行
    store._vm.$watch(
      () => store._vm._data.$$state,
      () => {
        console.assert(store._committing, '在mutation之外更改了状态');
      },
      {
        deep: true,
        sync: true,
      }
    );
  }
  if (oldVm) {
    Vue.nextTick(() => oldVm.$destroyed());
  }
}
// 最终用户拿到的是这个类的实例
class Store {
  constructor(options) {
    // 格式化用户传入的参数，格式化成树形结构，更直观一些，后续也更好操作一些
    // 我们可以写个类来做这么一件事，就是把用户定义的所有模块，组成一棵父子嵌套的树
    this._modules = new ModuleCollection(options);
    // 上面收集模块生成一棵树，
    // 下面安装模块，将模块上的属性定义在store中，store就是this
    let state = this._modules.root.state;
    this._mutations = {}; // 存放所有模块中的mutations，先不考虑命名空间
    this._actions = {}; // 存放所有模块中的actions
    this._wrappedGetters = {}; // 存放所有模块中的getters
    this._subscribers = [];
    this.strict = options.strict; // 说明是严格模式
    // 同步的watcher
    this.committing = false;
    installModule(this, state, [], this._modules.root);
    // 将状态放到vue的实例中
    // 增加响应式效果
    resetStoreVm(this, state);
    options.plugins.forEach((plugin) => plugin(this));
    // 用户传递过来的状态
    // let state = options.state;
    // getters:其实写的是方法，但是取的是属性
    // defineProperty去定义这个属性
    /**
     * this.getters = {};
    forEach(options.getters, (fn, key) => {
      Object.defineProperty(this.getters, key, {
        get: () => fn(this.state),
      });
    });
     * 如果按照这种方法处理的话，可能会出现这种情况
     * 如果在页面上使用{{$store.state.getAge}}
     * 如果此时还有一个state为a，而且在点击按钮的时候更新a的数据，那么这个getter还会重新执行
     * */
    // this.getters = {};
    // const computed = {};
    // forEach(options.getters, (fn, key) => {
    //   // 通过计算属性实现懒加载
    //   computed[key] = () => {
    //     return fn(this.state);
    //   };
    //   Object.defineProperty(this.getters, key, {
    //     get: () => this._vm[key],
    //   });
    // });
    // 如果直接将state定义在实例上，稍后这个状态发生变化，视图是不会更新的
    // vue中定义数据 属性名是有特点的 如果属性名是通过$xxx命名的 那么这个属性是不会被代理到vue的实例上，但是会在实例的_data里面
    // this._vm = new Vue({
    //   data() {
    //     // 这里state就可以进行依赖收集了
    //     return { $$state: state };
    //   },
    //   // 计算属性会将自己的属性放到实例上
    //   computed,
    // });
    // // 发布订阅模式 将用户定义的mutation和action先保存起来，稍后当调用commit时，就找到订阅的mutation方法，调用dispatch就找对应的action方法
    // this._mutations = {};
    // forEach(options.mutations, (fn, key) => {
    //   this._mutations[key] = (payload) => fn.call(this, this.state, payload);
    // });
    // this._actions = {};
    // forEach(options.actions, (fn, key) => {
    //   this._actions[key] = (payload) => fn.call(this, this, payload);
    // });
  }
  _withCommitting(fn) {
    let committing = this._committing;
    this._committing = true; //在函数调用前 表示_committing为true
    fn();
    this._committing = committing;
  }
  subscribe(fn) {
    this._subscribers.push(fn);
  }
  // 采用箭头函数的原因是用户在使用的时候可能会采用解构的方式使用commit，导致this错乱let {commit} = store
  commit = (type, payload) => {
    this._mutations[type].forEach((fn) => {
      fn(payload);
    });
  };
  dispatch = (type, payload) => {
    this._actions[type].forEach((fn) => {
      fn(payload);
    });
  };
  replaceState(newState) {
    // 用最新的状态替换掉
    // this._vm.data.$$state = newState;
    this._withCommitting(() => {
      this._vm._data.$$state = newState;
    });
  }
  //   类的属性访问器，当用户去这个实例上取state属性时，会执行此方法
  get state() {
    return this._vm._data.$$state;
  }
  registerModule(path, rawModule) {
    if (typeof path === 'string') path = [path];
    // 模块注册
    this._modules.register(path, rawModule);
    // 安装模块 动态地将状态新增上去
    // 第四个参数是一个Module实例，所以要处理一下rawModule
    installModule(this, this.state, path, rawModule.newModule);
    // 但是到这位置，动态新增模块还有一点小bug，计算属性都没有实现
    // 重新定义getters，在这之前要清空掉之前的vue实例
    resetStoreVm(this, this.state);
  }
}

// _Vue是Vue.use的时候用户传过来的
const install = (_Vue) => {
  Vue = _Vue;
  //   install的目的是什么
  //   目的是将store定义在每个组件上
  applyMixin(Vue);
};

export { Store, install };
