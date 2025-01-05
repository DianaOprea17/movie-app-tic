import { createRouter, createWebHistory } from 'vue-router';
import RegisterUser from '@/components/RegisterUser.vue';


const routes = [
    { path: '/register', component: RegisterUser },
   
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes,
  });
  
  export default router;