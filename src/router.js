import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Callback from '@/views/Callback.vue'
import Landing from '@/views/Landing.vue'
import Dummy from '@/views/dummy.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback
    },
    {
      path: '/',
      name: 'landing',
      component: Landing
    },
    {
      path: '/dummy.vue',
      name: 'dummy',
      component: Dummy
    },
  ]
})

// very basic "setup" of a global guard

router.beforeEach((to, from, next) => {
  if(to.name == 'callback' || to.name == 'landing') { // check if "to"-route is "callback" and allow access
    next()
  } else if (router.app.$auth.isAuthenticated()) { // if authenticated allow access
    next()
  } else if (to.name == 'dummy' ) { // if authenticated allow access
      router.app.$auth.login()
  } else { // trigger auth0 login
    router.app.$auth.login()
  }
})


export default router
