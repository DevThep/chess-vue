// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Axios from 'axios'
import store from './store'
// ---------------------
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'

import VueStomp from 'vue-stomp'
Vue.use(VueStomp, 'http://localhost:3000/web_socket')

Vue.use(BootstrapVue)

Vue.$http = Axios
// ---------------------
// Axios.defaults.baseURL = 'https://iccs340-vue-api-auth.herokuapp.com/'
Axios.defaults.baseURL = 'http://localhost:3000/'
Axios.defaults.headers.common.Accept = 'application/json'
Axios.defaults.withCredentials = true

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
