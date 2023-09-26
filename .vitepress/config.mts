import { defineConfig } from 'vitepress'
import mdItCustomAttrs from "markdown-it-custom-attrs";
import Unocss from 'unocss/vite'
import { navbar } from "./navbar";
import { sidebar } from "./sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Go-Spring",
  description: "Go-Spring dedicated to providing users with a simple, secure, and reliable programming experience",
  ignoreDeadLinks: false,
  head: [
    ["meta", { name: "keywords", content: "go-spring" }],
    ["link", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    ["link", { rel: "stylesheet", href: "/css/fancybox.css" }],
    ["script", { src: "/js/fancybox.umd.js" }],
    ["script", { async: '', src: "https://www.googletagmanager.com/gtag/js?id=G-R7Y0434QHZ"}],
    ["script", {}, "window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'G-R7Y0434QHZ');"]
  ],
  markdown: {
    theme: {
      light: "vitesse-light",
      dark: "vitesse-dark",
    },
    config: (md) => md.use(mdItCustomAttrs, "image", { "data-fancybox": "gallery" }),
  },
  lastUpdated: true,
  cleanUrls: true,
  srcDir: "./src",
  sitemap: {
    hostname: 'https://go-spring.dev',
    transformItems(items) {
      return items.filter((item) => !item.url.includes('migration'))
    }
  },

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "Go-Spring",
    nav: navbar,
    sidebar: sidebar,

    socialLinks: [
      { icon: 'github', link: 'https://github.com/go-spring-projects/go-spring' }
    ],

    editLink: {
      pattern: 'https://github.com/go-spring-projects/go-spring.dev/edit/master/src/:path',
      text: 'Edit this page on GitHub'
    },

    search: {
      provider: "local",
      options: {
      }
    },

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2019-present go-spring-projects'
    },
  },

  vite: {
    plugins: [
      Unocss(),
    ],
  },
})
