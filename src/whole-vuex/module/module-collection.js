import { forEach } from '../util';
import Module from './module';

export default class ModuleCollection {
  constructor(options) {
    // 在这格式化成树形结构
    // this.root = {
    //   // 原始的用户的配置
    //   _raw: xxx,
    //   _children: {
    //     a: {
    //       _raw: xxx,
    //       state: a.state,
    //     },
    //     b: {
    //       _raw: xxx,
    //       _children: {},
    //       state: b.state,
    //     },
    //   },
    //   //   我们还可以把状态拿出来
    //   state: this.root.state,
    // };
    // 注册模块 肯定有个递归的操作，递归注册，我们注册完根模块之后，再把子模块注册到根模块上
    // vuex通过一个数组来记录每次要递归的状态
    this.register([], options);
  }
  //   代码直接这样写会觉得有点啰嗦，如果用面向对象的思想，如果涉及到对一个东西操作了，比如增删改查，那我们可以搞一个类来封装这个操作
  //   register(path, rootModule) {
  //     // 类似ast语法树解析
  //     let newModule = {
  //       _raw: rootModule,
  //       _children: {},
  //       state: rootModule.state,
  //     };
  //     if (path.length === 0) {
  //       this.root = newModule;
  //     } else {
  //       // 递归第二次就走到这里
  //       // [b,c]，b模块下的c
  //       // 这里应该有个找父亲的过程
  //       //   [a,b,c]，先把c去掉，reduce出来的就是c的根
  //       let parent = path.slice(0, -1).reduce((memo, current) => {
  //         return memo._children[current];
  //       }, this.root);
  //       parent._children[path[path.length - 1]] = newModule;
  //     }
  //     // 如果有modules说明有子模块
  //     if (rootModule.modoles) {
  //       forEach(rootModule.modoles, (module, moduleName) => {
  //         this.register([...path, moduleName], module);
  //       });
  //     }
  //   }
  register(path, rootModule) {
    // 类似ast语法树解析
    // 抽离成Module类
    let newModule = new Module(rootModule);
    // 在当前要注册的模块上，做一个映射，这一步主要是为了在store.registerModule安装模块的时候，里面的installModule第四个参数能拿到Module实例
    rootModule.newModule = newModule;
    if (path.length === 0) {
      this.root = newModule;
    } else {
      // 递归第二次就走到这里
      // [b,c]，b模块下的c
      // 这里应该有个找父亲的过程
      //   [a,b,c]，先把c去掉，reduce出来的就是c的根
      let parent = path.slice(0, -1).reduce((memo, current) => {
        return memo.getChild(current);
      }, this.root);
      parent.addChild(path[path.length - 1], newModule);
    }
    // 如果有modules说明有子模块
    if (rootModule.modules) {
      forEach(rootModule.modules, (module, moduleName) => {
        this.register([...path, moduleName], module);
      });
    }
  }
  // 获取命名空间
  getNamespace(path) {
    let root = this.root;
    return path.reduce((namespace, key) => {
      // 这里要看看当前的模块有没有namespace
      root = root.getChild(key);
      return namespace + (root.namespaced ? key + '/' : '');
    }, '');
  }
}
