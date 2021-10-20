

import ErrorBoundary from "./components/errorBoundary"
import { GitHubSearchPage } from "./components/gitHubSearchPage"

const App = () => {
  return (
    <ErrorBoundary>
      <GitHubSearchPage />
    </ErrorBoundary>
  )
}

export default App

