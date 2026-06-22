import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'

import { createPinia } from 'pinia'

const app = createApp(App)

app.use(createPinia())

app.use(router)
app.use(ElementPlus)

app.mount('#app')
