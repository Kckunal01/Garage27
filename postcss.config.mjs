/**
 * Next.js' default PostCSS pipeline (flexbugs + preset-env stage 3 +
 * autoprefixer) plus ONE addition: the Garage 27 composition breakpoints in
 * src/styles/breakpoints.css are injected into every stylesheet, so all CSS
 * writes `@media (--desktop)` instead of hardcoding pixel values.
 */
const config = {
  plugins: {
    '@csstools/postcss-global-data': { files: ['src/styles/breakpoints.css'] },
    'postcss-custom-media': {},
    'postcss-flexbugs-fixes': {},
    'postcss-preset-env': {
      autoprefixer: { flexbox: 'no-2009' },
      stage: 3,
      features: { 'custom-properties': false },
    },
  },
}

export default config
