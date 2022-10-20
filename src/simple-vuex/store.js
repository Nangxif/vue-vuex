import applyMixin from './mixin';
import { forEach } from './util';
let Vue;
// 最终用户拿到的是这个类的实例
class Store {
  constructor(options) {
    // 用户传递过来的状态
    let state = options.state;

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
    this.getters = {};
    const computed = {};
    forEach(options.getters, (fn, key) => {
      // 通过计算属性实现懒加载
      computed[key] = () => {
        return fn(this.state);
      };
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key],
      });
    });
    // 如果直接将state定义在实例上，稍后这个状态发生变化，视图是不会更新的
    // vue中定义数据 属性名是有特点的 如果属性名是通过$xxx命名的 那么这个属性是不会被代理到vue的实例上，但是会在实例的_data里面
    this._vm = new Vue({
      data() {
        // 这里state就可以进行依赖收集了
        return { $$state: state };
      },
      // 计算属性会将自己的属性放到实例上
      computed,
    });
    // 发布订阅模式 将用户定义的mutation和action先保存起来，稍后当调用commit时，就找到订阅的mutation方法，调用dispatch就找对应的action方法
    this._mutations = {};
    forEach(options.mutations, (fn, key) => {
      this._mutations[key] = (payload) => fn.call(this, this.state, payload);
    });
    this._actions = {};
    forEach(options.actions, (fn, key) => {
      this._actions[key] = (payload) => fn.call(this, this, payload);
    });
  }
  // 采用箭头函数的原因是用户在使用的时候可能会采用解构的方式使用commit，导致this错乱let {commit} = store
  commit = (type, payload) => {
    this._mutations[type](payload);
  };
  dispatch = (type, payload) => {
    this._actions[type](payload);
  };
  //   类的属性访问器，当用户去这个实例上取state属性时，会执行此方法
  get state() {
    return this._vm._data.$$state;
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
