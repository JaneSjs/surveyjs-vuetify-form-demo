import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { surveyPlugin } from 'survey-vue3-ui'

import './style.css'

createApp(App).use(vuetify).use(surveyPlugin).mount('#app')
