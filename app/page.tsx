import App from './components/App'
import { ProfilesProvider } from './contexts/ProfilesContext'
import { SavedScenariosProvider } from './contexts/SavedScenariosContext'

export default function Home() {
  return (
    <main>
      <ProfilesProvider>
        <SavedScenariosProvider>
          <App />
        </SavedScenariosProvider>
      </ProfilesProvider>
    </main>
  )
}
