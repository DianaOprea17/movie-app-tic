import { createRouter, createWebHistory } from 'vue-router';
import RegisterUser from '@/components/RegisterUser.vue';
import LoginUser from '@/components/LoginUser.vue';
import HomePage from '@/components/HomePage.vue';

const routes = [
    { path: '/register', component: RegisterUser },
    { path: '/', component: LoginUser },
    { path: '/home', component: HomePage},
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  
 

  export default router;