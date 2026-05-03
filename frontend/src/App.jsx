import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import MapComponent from './components/Map'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MapComponent></MapComponent>
    </>
  )
}

export default App
