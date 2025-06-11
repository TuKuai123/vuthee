import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/use'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/login',
      component:() => import('@/views/login/LoginPage.vue')
    },
    {
      path:'/',
      component:() => import('@/views/layout/LayouContainer.vue'),
      redirect:'/works/workOne',
      children:[
        {
          path:'/works/workOne',
          component:() => import('@/views/works/WorkOne.vue')
        },
        {
          path:'/works/workTwo',
          component:() => import('@/views/works/WorkTwo.vue')
        },
        {
          path:'/user/avatar',
          component: () => import('@/views/user/UserAvatar.vue')
        },
        {
          path:'/user/password',
          component: () => import('@/views/user/UserPassword.vue')
        },
        {
          path:'/user/profile',
          component: () => import('@/views/user/UserProfile.vue')
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  const useStore = useUserStore()
  if (!useStore.token && to.path !== '/login') return '/login'
})


export default router
