export default defineAppConfig({
    ui: {
        // Font configuration for Nuxt UI v4
        fontFamily: {
            sans: 'Roboto Condensed, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
            heading: 'Roboto Slab, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif'
        },

        // Typography defaults
        typography: {
            DEFAULT: {
                css: {
                    fontFamily: 'Roboto Condensed, sans-serif',
                    h1: {
                        fontFamily: 'Roboto Slab, sans-serif',
                        fontWeight: '700',
                    },
                    h2: {
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '600',
                    },
                    h3: {
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: '600',
                    },
                }
            }
        },

        // Color configuration with dark mode support
        colors: {
            primary: 'red',
            secondary: 'pink',
            success: 'green',
            info: 'blue',
            warning: 'orange',
            error: 'red',
            neutral: 'zinc'
        },
        
        // Dark mode configuration
        darkMode: true,
        
        // Semantic colors for dark/light mode
        variables: {
            light: {
                background: '255 255 255',
                foreground: 'var(--color-gray-700)'
            },
            dark: {
                background: 'var(--color-gray-900)',
                foreground: 'var(--color-gray-200)'
            }
        },
        
        // Container configuration
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        }
    }
})


