import { useState } from 'react'

const KeyCreate = ({ callback }: { callback: (username: string) => void }) => {
  const [username, setUsername] = useState<string>('')

  return (
    <div className="flex flex-col h-full justify-center items-center text-center space-y-4">
      <h1 className="text-white text-2xl font-semibold">Live Chat</h1>
      <p className="text-white text-sm font-medium">
        Enter a username to start chatting.
      </p>

      <div className="space-y-2 flex flex-col">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="Enter a username..."
          className="bg-black border border-white/25 rounded-lg placeholder:text-white/50 text-white text-sm font-medium py-2 px-4 w-64"
          required
        />
        <button
          onClick={() => callback(username)}
          className="bg-blue-500 font-medium rounded-lg text-white inline-flex justify-center items-center py-2 px-4"
        >
          Enter
        </button>
      </div>
    </div>
  )
}

export default KeyCreate
