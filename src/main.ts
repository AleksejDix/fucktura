import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';
import { i18n } from './i18n';
import ImageWithPlaceholder from './components/ImageWithPlaceholder.vue';

const app = createApp(App);
app.component('ImageWithPlaceholder', ImageWithPlaceholder);
app.use(createPinia());
app.use(i18n);
app.mount('#app');
