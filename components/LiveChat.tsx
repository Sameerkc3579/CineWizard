"use client";

import { useEffect, useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { io, Socket } from "socket.io-client";
import { MessageCircle, X, Send, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface LiveChatProps {
    user: User | null;
}

interface Message {
    id: string;
    user: { name: string; avatar?: string };
    senderSocketId?: string;
    text: string;
    timestamp: string;
}

export function LiveChat({ user }: LiveChatProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [userCount, setUserCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Connect to socket
    useEffect(() => {
        if (!isOpen) return;

        // Use localhost for dev. In prod, this would be an env var.
        const socketUrl = "http://localhost:3001";
        const newSocket = io(socketUrl);

        newSocket.on("connect", () => {
            console.log("Connected to Chat Server");
        });

        newSocket.on("chat:history", (history: Message[]) => {
            setMessages(history);
        });

        newSocket.on("chat:message", (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        newSocket.on("users:count", (count: number) => {
            setUserCount(count);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim() || !socket) return;

        // Fallback name logic
        const userName = user?.user_metadata?.full_name ||
            user?.email?.split('@')[0] ||
            `Guest Wizard ${socket.id ? socket.id.substring(0, 4) : '?'}`;

        socket.emit("chat:message", {
            user: { name: userName },
            text: inputValue,
        });
        setInputValue("");
    };

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[90vw] sm:w-[380px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col h-[600px] max-h-[70vh]"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm tracking-wide">GLOBAL CHAT</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] text-white/40 font-medium">{userCount} wizards online</p>
                                        {!user && (
                                            <button onClick={handleLogin} className="text-[10px] text-violet-400 hover:text-violet-300 font-bold underline decoration-violet-400/30 underline-offset-2 ml-2">
                                                Sign In
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-4"
                            ref={scrollRef}
                        >
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                    <MessageCircle size={32} />
                                    <p className="text-sm">No messages yet. Be the first!</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => {
                                // Determine if this message is mine based on socket ID if available, otherwise fallback to name
                                const isMe = msg.senderSocketId
                                    ? msg.senderSocketId === socket?.id
                                    : msg.user.name === (user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Guest User");

                                // Check if previous message was from same user for grouping (simple check)
                                const isSequence = idx > 0 && messages[idx - 1].senderSocketId === msg.senderSocketId;

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isSequence ? 'mt-1' : 'mt-4'}`}>
                                        {!isSequence && !isMe && (
                                            <span className="text-[10px] text-white/40 mb-1 ml-1 uppercase tracking-wider font-bold">{msg.user.name}</span>
                                        )}
                                        <div
                                            className={`max-w-[85%] px-4 py-2.5 text-sm shadow-sm ${isMe
                                                    ? "bg-violet-600 text-white rounded-2xl rounded-tr-sm"
                                                    : "bg-[#1a1a1a] border border-white/5 text-gray-200 rounded-2xl rounded-tl-sm"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-white/5 bg-[#0a0a0a]/50">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={user ? "Type your message..." : "Type as Guest..."}
                                    className="flex-1 bg-white/5 border border-white/5 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim()}
                                    className="p-2.5 bg-violet-600 hover:bg-violet-500 rounded-full text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]"
                                >
                                    <Send size={16} className={inputValue.trim() ? "translate-x-0.5" : ""} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto p-4 rounded-full shadow-2xl transition-all duration-300 border border-white/10 group
            ${isOpen ? 'bg-[#1a1a1a] text-white' : 'bg-violet-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:shadow-[0_0_30px_rgba(124,58,237,0.6)]'}
        `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} className="group-hover:animate-pulse" />}
            </motion.button>
        </div>
    );
}
