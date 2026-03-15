/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Inter Variable"', '"Inter"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
                display: ['"Space Grotesk"', 'sans-serif'],
            },
            colors: {
                void: 'var(--bg-void)',
                deep: 'var(--bg-deep)',
                surface: 'var(--bg-surface)',
                elevated: 'var(--bg-elevated)',
                overlay: 'var(--bg-overlay)',

                primary: 'var(--text-primary)',
                secondary: 'var(--text-secondary)',
                muted: 'var(--text-muted)',
                disabled: 'var(--text-disabled)',

                accent: {
                    primary: 'var(--accent-primary)',
                    'primary-dim': 'var(--accent-primary-dim)',
                    'primary-glow': 'var(--accent-primary-glow)',
                    secondary: 'var(--accent-secondary)',
                    'secondary-dim': 'var(--accent-secondary-dim)',
                    'secondary-glow': 'var(--accent-secondary-glow)',
                    fire: 'var(--accent-fire)',
                    'fire-dim': 'var(--accent-fire-dim)',
                    'fire-glow': 'var(--accent-fire-glow)',
                },

                status: {
                    success: 'var(--status-success)',
                    warning: 'var(--status-warning)',
                    error: 'var(--status-error)',
                    info: 'var(--status-info)',
                },

                border: {
                    subtle: 'var(--border-subtle)',
                    default: 'var(--border-default)',
                    strong: 'var(--border-strong)',
                    accent: 'var(--border-accent)',
                }
            },
            spacing: {
                'space-1': 'var(--space-1)',
                'space-2': 'var(--space-2)',
                'space-3': 'var(--space-3)',
                'space-4': 'var(--space-4)',
                'space-5': 'var(--space-5)',
                'space-6': 'var(--space-6)',
                'space-8': 'var(--space-8)',
                'space-10': 'var(--space-10)',
                'space-12': 'var(--space-12)',
                'space-16': 'var(--space-16)',
            },
            borderRadius: {
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-lg)',
                xl: 'var(--radius-xl)',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                'glow-teal': 'var(--shadow-glow-teal)',
                'glow-violet': 'var(--shadow-glow-violet)',
            },
            backgroundImage: {
                'gradient-hero': 'var(--gradient-hero)',
                'gradient-card': 'var(--gradient-card)',
                'gradient-teal': 'var(--gradient-teal)',
                'gradient-fire': 'var(--gradient-fire)',
                'gradient-badge-gmn': 'var(--gradient-badge-gmn)',
                'gradient-badge-nasa': 'var(--gradient-badge-nasa)',
            }
        },
    },
    plugins: [],
}
