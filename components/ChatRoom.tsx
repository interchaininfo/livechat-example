import { StdTx } from '@cosmjs/amino'
import { decrypt } from '@swiftprotocol/guard-v1'
import { EncryptResult } from '@swiftprotocol/guard-v1/types/encryption'
import axios, { AxiosResponse } from 'axios'
import { useEffect } from 'react'
import io from 'socket.io-client'
import { KeyPair } from './Content.jsx'

// Function to generate SHA-256 hash
function sha256(input: string) {
  const buffer = new TextEncoder().encode(input)
  return crypto.subtle.digest('SHA-256', buffer).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  })
}

// Function to convert hash to color
function hashToColor(hash: string) {
  const hexColor = hash.substring(0, 6) // Take the first 6 characters of the hash
  const r = parseInt(hexColor.substring(0, 2), 16)
  const g = parseInt(hexColor.substring(2, 4), 16)
  const b = parseInt(hexColor.substring(4, 6), 16)

  // Increase RGB values to make the color lighter
  const lightR = Math.min(r + 100, 255)
  const lightG = Math.min(g + 100, 255)
  const lightB = Math.min(b + 100, 255)

  return `rgb(${lightR}, ${lightG}, ${lightB})`
}

const ChatRoom = ({
  keyPair,
  username,
  walletSignature,
}: {
  keyPair: KeyPair
  username: string
  walletSignature: StdTx
}) => {
  useEffect(() => {
    const encodedWalletSignature = Buffer.from(
      JSON.stringify(walletSignature)
    ).toString('base64')

    const socket = io(process.env.NEXT_PUBLIC_GUARD_WS + 'livechat', {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      query: {
        pubkey: keyPair.publicKeyHex,
        username,
        walletSignature: encodedWalletSignature,
      },
    })

    const input = document.getElementById('input') as HTMLInputElement
    const messages = document.getElementById('messages') as HTMLUListElement
    const button = document.getElementById('submit') as HTMLButtonElement

    button.addEventListener('click', async (e) => {
      e.preventDefault()
      if (input.value) {
        const clientsResponse: AxiosResponse<{
          clients: { pubkey: string; username: string }[]
        }> = await axios.get(
          process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/clients'
        )

        const { clients } = clientsResponse.data
        const msg = input.value

        console.log(msg)

        const encryptResult: AxiosResponse<{ encryptedData: EncryptResult }> =
          await axios.post('/api/encrypt', {
            data: msg,
            recipients: [keyPair.publicKeyHex, ...clients.map((c) => c.pubkey)],
          })

        const { encryptedData } = encryptResult.data

        socket.emit('chatMsgFromClient', JSON.stringify(encryptedData))

        input.value = ''
      }
    })

    socket.on(
      'chatMsgFromServer',
      async (senderPubKey, senderUsername, content) => {
        const item = document.createElement('li')

        console.log(content)

        const encryptedData = JSON.parse(content) as EncryptResult
        const symmetricKey = encryptedData.symmetricKeys.find(
          (symmetricKey) => symmetricKey.recipient === keyPair.publicKeyHex
        )

        if (!symmetricKey) {
          item.textContent = '[Could not decrypt this message.]'
          messages.appendChild(item)
          window.scrollTo(0, document.body.scrollHeight)
          return
        }

        const decryptedValue = await decrypt({
          symmetricKey,
          cipherText: encryptedData.cipherText,
          recipientPrivateKey: keyPair.privateKeyHex,
        })

        const hash = await sha256(senderPubKey)
        const color = hashToColor(hash)

        item.innerHTML = `<b style="color: ${color}">${senderUsername}</b>: ${decryptedValue}`
        messages.appendChild(item)
        window.scrollTo(0, document.body.scrollHeight)
      }
    )
  }, [])

  return (
    <div>
      <ul id="messages" className="p-6"></ul>
      <div
        id="form"
        className="fixed bottom-0 w-screen p-4 h-[4.5rem] grid grid-cols-6 gap-4"
      >
        <input
          className="bg-black text-white border px-4 border-white/25 rounded-md col-span-5"
          id="input"
          autoComplete="off"
        />
        <button id="submit" className="bg-blue-500 rounded-md text-white">
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatRoom
