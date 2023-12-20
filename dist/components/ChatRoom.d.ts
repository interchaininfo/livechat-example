import { StdTx } from '@cosmjs/amino';
import { KeyPair } from './Content.jsx';
declare const ChatRoom: ({ keyPair, username, walletSignature, }: {
    keyPair: KeyPair;
    username: string;
    walletSignature: StdTx;
}) => import("react/jsx-runtime").JSX.Element;
export default ChatRoom;
