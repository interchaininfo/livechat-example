import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const KeyCreate = ({ callback }) => {
    const [username, setUsername] = useState('');
    return (_jsxs("div", { className: "flex flex-col h-full justify-center items-center text-center space-y-4", children: [_jsx("h1", { className: "text-white text-2xl font-semibold", children: "Live Chat" }), _jsx("p", { className: "text-white text-sm font-medium", children: "Enter a username to start chatting." }), _jsxs("div", { className: "space-y-2 flex flex-col", children: [_jsx("input", { type: "text", value: username, onChange: (e) => setUsername(e.currentTarget.value), placeholder: "Enter a username...", className: "bg-black border border-white/25 rounded-lg placeholder:text-white/50 text-white text-sm font-medium py-2 px-4 w-64", required: true }), _jsx("button", { onClick: () => callback(username), className: "bg-blue-500 font-medium rounded-lg text-white inline-flex justify-center items-center py-2 px-4", children: "Enter" })] })] }));
};
export default KeyCreate;
//# sourceMappingURL=KeyCreate.js.map