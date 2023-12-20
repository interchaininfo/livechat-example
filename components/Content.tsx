import { StdTx } from '@cosmjs/amino'
import { useChain } from '@interchaininfo/sdk'
import axios, { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import chainInfo from '../config.js'
import ChatRoom from './ChatRoom.jsx'
import KeyCreate from './KeyCreate.jsx'
import Spinner from './Spinner.jsx'

export interface KeyPair {
  privateKeyHex: string
  publicKeyHex: string
}

const TrollboxContent = () => {
  const [keyPair, setKeyPair] = useState<KeyPair | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [walletSignature, setWalletSignature] = useState<StdTx | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { client } = useChain()

  useEffect(() => {
    async function effect() {
      if (client.baseWallet && !username) {
        try {
          setIsLoading(true)
          const registrationResponse: AxiosResponse<{
            registration: { address: string; username: string }
          }> = await axios.post(
            process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/registration',
            { address: client.wallet.address }
          )
          console.log(registrationResponse)
          const { registration } = registrationResponse.data

          const { walletSignature } = await handleSignAuthMsg(
            registration.username
          )
          await handleCreateKey(registration.username)
          setWalletSignature(walletSignature)
          setIsLoading(false)
        } catch (e) {
          setIsLoading(false)
        }
      }
    }
    effect()
  }, [client.baseWallet])

  const handleCreateKey = async (username: string) => {
    console.log(username)
    if (username.length === 0) {
      return
    }

    const key = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 1024,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    )

    const privateKeyBuffer = await crypto.subtle.exportKey(
      'pkcs8',
      key.privateKey
    )
    const privateKeyHex = Buffer.from(privateKeyBuffer).toString('hex')

    const publicKeyBuffer = await crypto.subtle.exportKey('spki', key.publicKey)
    const publicKeyHex = Buffer.from(publicKeyBuffer).toString('hex')

    setKeyPair({ privateKeyHex, publicKeyHex })
    setUsername(username)
  }

  const handleSignAuthMsg = async (username: string) => {
    const authMsg = 'Enter livechat with username ' + username
    const signature = await client.baseWallet.signArbitrary(
      chainInfo.chainId,
      client.wallet.address,
      authMsg
    )

    const walletSignature: StdTx = {
      msg: [
        {
          type: 'sign/MsgSignData',
          value: {
            signer: client.wallet.address,
            data: btoa(authMsg),
          },
        },
      ],
      fee: { gas: '0', amount: [] },
      memo: '',
      signatures: [signature],
    }

    const encodedSignature = Buffer.from(
      JSON.stringify(walletSignature)
    ).toString('base64')

    return { walletSignature, encodedSignature }
  }

  const handleRegister = async (username: string) => {
    if (username.length === 0 || !client || !client.baseWallet) {
      return
    }

    try {
      const { walletSignature, encodedSignature } =
        await handleSignAuthMsg(username)

      const response = await axios.post(
        process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/register',
        { walletSignature: encodedSignature, username }
      )

      if (response.status !== 200) {
        alert('Error registering username, name may already be taken')
        return
      }

      await handleCreateKey(username)
      setWalletSignature(walletSignature)
    } catch (e) {
      alert('Error registering username, name may already be taken')
    }
  }

  return isLoading ? (
    <div className="w-full h-full flex justify-center items-center">
      <Spinner className="w-12 h-12 text-white" />
    </div>
  ) : keyPair && username ? (
    <ChatRoom
      keyPair={keyPair}
      username={username}
      walletSignature={walletSignature}
    />
  ) : (
    <KeyCreate callback={handleRegister} />
  )
}

export default TrollboxContent
