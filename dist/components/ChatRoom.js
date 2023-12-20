var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { decrypt } from '@swiftprotocol/guard-v1';
import axios from 'axios';
import { useEffect } from 'react';
import io from 'socket.io-client';
// Function to generate SHA-256 hash
function sha256(input) {
    const buffer = new TextEncoder().encode(input);
    return crypto.subtle.digest('SHA-256', buffer).then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    });
}
// Function to convert hash to color
function hashToColor(hash) {
    const hexColor = hash.substring(0, 6); // Take the first 6 characters of the hash
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    // Increase RGB values to make the color lighter
    const lightR = Math.min(r + 100, 255);
    const lightG = Math.min(g + 100, 255);
    const lightB = Math.min(b + 100, 255);
    return `rgb(${lightR}, ${lightG}, ${lightB})`;
}
const ChatRoom = ({ keyPair, username, walletSignature, }) => {
    useEffect(() => {
        const encodedWalletSignature = Buffer.from(JSON.stringify(walletSignature)).toString('base64');
        const socket = io(process.env.NEXT_PUBLIC_GUARD_WS + 'livechat', {
            transports: ['polling', 'websocket'],
            autoConnect: true,
            query: {
                pubkey: keyPair.publicKeyHex,
                username,
                walletSignature: encodedWalletSignature,
            },
        });
        const input = document.getElementById('input');
        const messages = document.getElementById('messages');
        const button = document.getElementById('submit');
        button.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            if (input.value) {
                const clientsResponse = yield axios.get(process.env.NEXT_PUBLIC_GUARD_API + 'ws/livechat/clients');
                const { clients } = clientsResponse.data;
                const msg = input.value;
                console.log(msg);
                const encryptResult = yield axios.post('/api/encrypt', {
                    data: msg,
                    recipients: [keyPair.publicKeyHex, ...clients.map((c) => c.pubkey)],
                });
                const { encryptedData } = encryptResult.data;
                socket.emit('chatMsgFromClient', JSON.stringify(encryptedData));
                input.value = '';
            }
        }));
        socket.on('chatMsgFromServer', (senderPubKey, senderUsername, content) => __awaiter(void 0, void 0, void 0, function* () {
            const item = document.createElement('li');
            console.log(content);
            const encryptedData = JSON.parse(content);
            const symmetricKey = encryptedData.symmetricKeys.find((symmetricKey) => symmetricKey.recipient === keyPair.publicKeyHex);
            if (!symmetricKey) {
                item.textContent = '[Could not decrypt this message.]';
                messages.appendChild(item);
                window.scrollTo(0, document.body.scrollHeight);
                return;
            }
            const decryptedValue = yield decrypt({
                symmetricKey,
                cipherText: encryptedData.cipherText,
                recipientPrivateKey: keyPair.privateKeyHex,
            });
            const hash = yield sha256(senderPubKey);
            const color = hashToColor(hash);
            item.innerHTML = `<b style="color: ${color}">${senderUsername}</b>: ${decryptedValue}`;
            messages.appendChild(item);
            window.scrollTo(0, document.body.scrollHeight);
        }));
    }, []);
    return (_jsxs("div", { children: [_jsx("ul", { id: "messages", className: "p-6" }), _jsxs("div", { id: "form", className: "fixed bottom-0 w-screen p-4 h-[4.5rem] grid grid-cols-6 gap-4", children: [_jsx("input", { className: "bg-black text-white border px-4 border-white/25 rounded-md col-span-5", id: "input", autoComplete: "off" }), _jsx("button", { id: "submit", className: "bg-blue-500 rounded-md text-white", children: "Send" })] })] }));
};
export default ChatRoom;
//# sourceMappingURL=ChatRoom.js.map