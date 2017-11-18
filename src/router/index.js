import Vue from 'vue'
import Router from 'vue-router'
import LogIn from '@/components/LogIn'
import SignUp from '@/components/SignUp'
import Home from '@/components/Home'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'LogIn',
      component: LogIn
    },
    {
      path: '/home',
      name: 'Home',
      component: Home
    },
    {
      path: '/signup',
      name: 'SignUp',
      component: SignUp
    },
    {
      path: '/*',
      component: LogIn
    }
  ]
})
