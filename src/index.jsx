import './style.css'
import { hydrate, prerender as ssr } from 'preact-iso'
import { useState } from 'preact/hooks'

const surpriseOptions = [
  'Who won the latest Novel Peace Prize?',
  'Where does pizza come from?',
  'Who do you make a BLT sandwitch?',
]

const CHATBOT_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3000/gemini'

export function App() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState([])

  const surprise = () => {
    const randomValue =
      surpriseOptions[Math.floor(Math.random() * surpriseOptions.length)]
    setValue(randomValue)
  }

  const getResponse = async () => {
    if (!value) {
      setError('Error! Please ask a question!')
      return
    }
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify({
          history: chatHistory,
          message: value,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }
      const res = await fetch(CHATBOT_URL, options)
      const data = await res.text()
      setChatHistory((oldChatHistory) => [
        ...oldChatHistory,
        {
          role: 'user',
          parts: [{ text: value }],
        },
        {
          role: 'model',
          parts: [{ text: data }],
        },
      ])
      setValue('')
    } catch (error) {
      setError('Something went wrong! Please try again later.')
    }
  }

  const clear = () => {
    setValue('')
    setError('')
    setChatHistory([])
  }

  const handleValueChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <div className='app'>
      <p>
        What do you want to know?
        <button className='surprise' onClick={surprise} disabled={!chatHistory}>
          Surprise ME
        </button>
      </p>
      <div className='input-container'>
        <input
          value={value}
          placeholder='When is Christmas...?'
          onChange={handleValueChange}
        />
        {!error && <button onClick={getResponse}>Ask me</button>}
        {error && <button onClick={clear}>Clear</button>}
      </div>
      {error && <p>{error}</p>}
      <div className='search-result'>
        {chatHistory.map((chatItem, _index) => (
          <div key={_index}>
            <p className='answer'>
              {chatItem.role} : {chatItem.parts[0].text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

if (typeof window !== 'undefined') {
  hydrate(<App />, document.getElementById('app'))
}

export async function prerender(data) {
  return await ssr(<App {...data} />)
}
