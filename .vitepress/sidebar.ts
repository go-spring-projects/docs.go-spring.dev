import { DefaultTheme } from "vitepress";

export const sidebar: DefaultTheme.Sidebar = {
    "/guide/" : [
        {
            text: 'Introduction',
            items: [
                { text: 'What is Go-Spring', link: '/guide/' },
                { text: 'Getting Started', link: '/guide/getting-started' }
            ]
        }
    ]
}