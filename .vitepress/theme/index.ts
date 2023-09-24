import DefaultTheme from 'vitepress/theme'
import {useData} from "vitepress";
import { watchEffect } from 'vue'
import { inBrowser } from 'vitepress'
import 'uno.css';

export default {
    ...DefaultTheme,
    setup() {
        const { lang } = useData()
        watchEffect(() => {
            if (inBrowser) {
                document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2024 00:00:00 UTC; path=/`
            }
        })
    }
}