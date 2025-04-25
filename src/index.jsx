import './style.css'
import { hydrate, prerender as ssr } from 'preact-iso'
import { useState } from 'preact/hooks'
import { Suspense, lazy } from 'preact/compat'
import { SendIcon } from './components/Icons'
const Markdown = lazy(() => import('react-markdown'))

const surpriseOptions = [
  'Who won the latest Novel Peace Prize?',
  'Where does pizza come from?',
  'Who do you make a BLT sandwich?',
]

const CHATBOT_URL =
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_API_URL
    : 'http://localhost:3000/gemini'

export function App() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [chatHistory, setChatHistory] = useState([])

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

  return (
    <div className='app'>
      <h1 className='title'>ChatBot AI</h1>

      <div className='search-result'>
        {chatHistory.map((chatItem, _index) => (
          <div
            key={_index}
            className={`chat-bubble ${
              chatItem.role === 'user' ? 'user' : 'model'
            }`}
          >
            <Suspense fallback={<span>Loading...</span>}>
              <Markdown>{chatItem.parts[0].text}</Markdown>
            </Suspense>
          </div>
        ))}
      </div>

      <div className='input-wrapper'>
        {chatHistory.length === 0 && (
          <div className='suggestions'>
            {surpriseOptions.map((option, index) => (
              <button
                key={index}
                className='suggestion'
                onClick={() => setValue(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        <div className='input-container'>
          <input
            value={value}
            placeholder='When is Christmas...?'
            onInput={(e) => setValue(e.currentTarget.value)}
          />
          <button onClick={getResponse}>
            <SendIcon />
          </button>
        </div>
        {error && <p className='error'>{error}</p>}
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
