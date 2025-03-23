import { useState, useRef, useEffect } from "react";
import styles from "@/styles/ChatWidget.module.css";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatWidget() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hi there! I'm your AI assistant. Feel free to ask me anything!" },
    ]);
    const [input, setInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: "Bearer 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",
                    "HTTP-Referer": "https://www.sitename.com",
                    "X-Title": "SiteName",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-r1:free",
                    messages: [{ role: "user", content: input }],
                }),
            });

            const data = await response.json();
            const botResponse: Message = { 
                role: "bot", 
                content: data.choices?.[0]?.message?.content || "No response received." 
            };
            setMessages((prev) => [...prev, botResponse]);
        } catch (error) {
            console.error("Error:", error);
            const errorMessage: Message = { 
                role: "bot", 
                content: "Sorry, an error occurred. Please try again." 
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    return (
        <>
            <div className={styles.chatButton} onClick={() => setIsOpen(!isOpen)}>
                💬
            </div>

            {isOpen && (
                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        <h4>ChatBot Assistant</h4>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className={styles.chatBody}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={msg.role === "user" ? styles.userMessage : styles.botMessage}>
                                {msg.content}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.chatInput}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </div>
            )}
        </>
    );
} 