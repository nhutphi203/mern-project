import { createContext, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

export const Context = createContext({isAuthenticated: false});

const AppWrapper = () =>{
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const[user,setUser] = useState({});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
