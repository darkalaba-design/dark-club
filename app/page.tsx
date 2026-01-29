import App from './components/App'
import { ProfilesProvider } from './contexts/ProfilesContext'

export default function Home() {
  return (
    <main>
      <ProfilesProvider>
        <App />
      </ProfilesProvider>
    </main>
  )
}
