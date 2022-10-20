// 主文件的作用一般就是整合操作
import { mapState, mapGetters, mapMutations, mapActions } from './helper';
import { Store, install } from './store';
export default {
  Store,
  install,
  mapState,
  mapGetters,
  mapMutations,
  mapActions,
};

// 我们有可能采用
// import {Store} from 'vuex'
export { Store, install, mapState, mapGetters, mapMutations, mapActions };
