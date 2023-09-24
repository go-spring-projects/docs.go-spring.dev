import { DefaultTheme } from "vitepress/types/default-theme";

export const navbar: DefaultTheme.NavItem[] = [
    {
        text: 'Guide',
        link: '/guide/'
    },
    {
        text: 'Release',
        link: 'https://github.com/go-spring-projects/go-spring/releases'
    },
    {
        text: 'API Doc',
        link: 'https://pkg.go.dev/github.com/go-spring-projects/go-spring'
    }
]