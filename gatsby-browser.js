// fonts
import './static/fonts/firacode.css';

// prism theme
import './static/prism-custom.css';

// reload when serviceworker updates - https://github.com/gatsbyjs/gatsby/issues/9087#issuecomment-459105021
export const onServiceWorkerUpdateReady = () => window.location.reload(true);
