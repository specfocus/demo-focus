import '../styles/globals.css'
import type { AppProps } from 'next/app'
/*
import dynamic from 'next/dynamic'

const DynamicComponent = dynamic(() => import('../components/hello'))
*/
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
