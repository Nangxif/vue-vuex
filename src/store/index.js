import Vue from 'vue';
import Vuex from '../whole-vuex';

Vue.use(Vuex);
// 只要是个插件那就是一个函数
// 数据持久化，引出vuex插件
// 注册完成之后默认会在内部调用这个插件，然后传入一个store
function persists(store) {
  let local = localStorage.getItem('VUEX:STATE');
  if (local) {
    // 更新原有状态
    store.replaceState(JSON.parse(local));
  }
  // 什么时候执行回调呢？状态变化就执行回调
  store.subscribe((mutation, state) => {
    // 只要频繁操作，那么要考虑防抖节流
    localStorage.setItem('VUEX:STATE', JSON.stringify(state));
  });
}

let store = new Vuex.Store({
  // 开启严格模式，严格模式下，只能通过mutation更改状态，其他都不可以
  strict: true,
  plugins: [persists],
  // 内部会创造一个vue实例，跨组件通信用的
  state: {
    // 组件的状态 new Vue(data)
    age: 26,
  },
  getters: {
    getAge(state) {
      // 获取计算属性new Vue(computed)依赖 当依赖的值发生变化，会重新执行
      // 如果state.age返回的结果相同，就不会重新执行这个函数
      return state.age + 10;
    },
  },
  mutations: {
    // vue中的方法，唯一可以改状态的方法
    // 更改状态的方式必须是同步的
    changeAge(state, payload) {
      // state.age += payload;
      // 如果我在mutation里面写了异步的逻辑就会报错
      setTimeout(() => {
        // 此时this._committing为false
        state.age += payload;
      }, 1000);
    },
  },
  actions: {
    // 通过action中发起请求
    // 所有的异步操作在action中
    changeAge({ state,commit }) {
      setTimeout(() => {
        state.age += 1;

        // commit('changeAge', 10);
      }, 3000);
    },
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        c: 100,
      },
      getters: {
        getAge(state) {
          return state.c + 20;
        },
      },
      mutations: {
        changeAge(state, payload) {
          console.log('c更新');
        },
      },
    },
    b: {
      // namespaced: true,
      state: {
        d: 100,
      },
      // getters: {
      //   getD(state) {
      //     return state.d + 100;
      //   },
      // },
      mutations: {
        changeAge(state, payload) {
          console.log('d更新');
        },
      },
      // modules: {
      //   d: {
      //     state: {
      //       e: 500,
      //     },
      //   },
      // },
      modules: {
        c: {
          namespaced: true,
          state: {
            e: 500,
          },
          mutations: {
            changeAge(state, payload) {
              console.log('b/c 更新');
            },
          },
        },
      },
    },
    e: {
      namespaced: true,
      state: {},
    },
  },
});

export default store;

/**
 * 下面展示一种比较少用的用法，如果我在上面定义完之后后悔了，觉得不够用，我们可以动态注册模块
 * registerModule第一个参数可以是字符串也可以是数组，在注册f的时候必须要有e模块，e模块的namespaced也必须是true，不然会报错
 * */
// store.registerModule(['e', 'f'], {
//   state: {
//     myAge: 100,
//   },
// });
