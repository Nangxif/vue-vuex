// 主文件的作用一般就是整合操作
import { Store, install } from './store';
export default {
  Store,
  install,
};

// 我们有可能采用
// import {Store} from 'vuex'
export { Store, install };
