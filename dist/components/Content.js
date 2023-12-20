var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx } from "react/jsx-runtime";
import { useChain } from '@interchaininfo/sdk';
import axios from 'axios';
import { useEffect, useState } from 'react';
import chainInfo from '../config.js';
import ChatRoom from './ChatRoom.jsx';
import KeyCreate from './KeyCreate.jsx';
import Spinner from './Spinner.jsx';
const TrollboxContent = () => {
    const [keyPair, setKeyPair] = useState(null);
    const [username, setUsername] = useState(null);
    const [walletSignature, setWalletSignature] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { client } = useChain();
    useEffect(() => {
        function effect() {
            return __awaiter(this, void 0, void 0, function* () {
                if (client.baseWallet && !username) {
                    try {
                        setIsLoading(true);
                        const registrationResponse = yield axios.post(process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/registration', { address: client.wallet.address });
                        console.log(registrationResponse);
                        const { registration } = registrationResponse.data;
                        const { walletSignature } = yield handleSignAuthMsg(registration.username);
                        yield handleCreateKey(registration.username);
                        setWalletSignature(walletSignature);
                        setIsLoading(false);
                    }
                    catch (e) {
                        setIsLoading(false);
                    }
                }
            });
        }
        effect();
    }, [client.baseWallet]);
    const handleCreateKey = (username) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(username);
        if (username.length === 0) {
            return;
        }
        const key = yield crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: 1024,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: 'SHA-256',
        }, true, ['encrypt', 'decrypt']);
        const privateKeyBuffer = yield crypto.subtle.exportKey('pkcs8', key.privateKey);
        const privateKeyHex = Buffer.from(privateKeyBuffer).toString('hex');
        const publicKeyBuffer = yield crypto.subtle.exportKey('spki', key.publicKey);
        const publicKeyHex = Buffer.from(publicKeyBuffer).toString('hex');
        setKeyPair({ privateKeyHex, publicKeyHex });
        setUsername(username);
    });
    const handleSignAuthMsg = (username) => __awaiter(void 0, void 0, void 0, function* () {
        const authMsg = 'Enter livechat with username ' + username;
        const signature = yield client.baseWallet.signArbitrary(chainInfo.chainId, client.wallet.address, authMsg);
        const walletSignature = {
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
        };
        const encodedSignature = Buffer.from(JSON.stringify(walletSignature)).toString('base64');
        return { walletSignature, encodedSignature };
    });
    const handleRegister = (username) => __awaiter(void 0, void 0, void 0, function* () {
        if (username.length === 0 || !client || !client.baseWallet) {
            return;
        }
        try {
            const { walletSignature, encodedSignature } = yield handleSignAuthMsg(username);
            const response = yield axios.post(process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/register', { walletSignature: encodedSignature, username });
            if (response.status !== 200) {
                alert('Error registering username, name may already be taken');
                return;
            }
            yield handleCreateKey(username);
            setWalletSignature(walletSignature);
        }
        catch (e) {
            alert('Error registering username, name may already be taken');
        }
    });
    return isLoading ? (_jsx("div", { className: "w-full h-full flex justify-center items-center", children: _jsx(Spinner, { className: "w-12 h-12 text-white" }) })) : keyPair && username ? (_jsx(ChatRoom, { keyPair: keyPair, username: username, walletSignature: walletSignature })) : (_jsx(KeyCreate, { callback: handleRegister }));
};
export default TrollboxContent;
//# sourceMappingURL=Content.js.map