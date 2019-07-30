import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home.vue'
import Callback from '@/views/Callback.vue'
import Landing from '@/views/Landing.vue'

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
  ]
})

// very basic "setup" of a global guard
router.beforeEach((to, from, next) => {
  if(to.name == 'callback') { // check if "to"-route is "callback" and allow access
    if (router.app.$auth.isAuthenticated()) {
        next();
      }else{
        router.app.$auth.login();
        next();
      }
  } else if(to.name == 'home') { // check if "to"-route is "callback" and allow access
    next();
  } else if(to.name == 'landing') { // check if "to"-route is "callback" and allow access

        next();

  } else if (router.app.$auth.isAuthenticated()) { // if authenticated allow access
    next()
  }else { // trigger auth0's login.
    // next()
     
     next()
  }
})




export default router
