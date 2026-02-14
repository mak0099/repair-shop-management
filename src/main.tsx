import ReactDOM from 'react-dom/client'
import { App } from './App'
import { config } from './lib/config'

async function enableMocking() {
  if (!config.useMock) {
    return
  }
  const { worker } = await import('./mocks/browser')
  return worker.start()
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
})
