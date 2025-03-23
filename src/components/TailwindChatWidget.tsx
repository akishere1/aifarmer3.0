import { useState, useRef, useEffect } from "react";
import { marked } from "marked";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function TailwindChatWidget() {
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
        <div>
            <button
                className="fixed bottom-5 right-5 p-4 bg-green-400 rounded-full shadow-lg hover:bg-green-500"
                onClick={() => setIsOpen(!isOpen)}
            >
                💬
            </button>

            {isOpen && (
                <div className="fixed bottom-20 right-5 w-80 h-96 bg-white shadow-xl rounded-lg flex flex-col border border-green-400">
                    <div className="p-3 bg-green-400 flex justify-between items-center text-black font-bold">
                        <span>ChatBot Assistant</span>
                        <button onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="flex-1 p-3 overflow-y-auto bg-gray-100">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 my-1 max-w-xs rounded-lg text-sm ${msg.role === "user" ? "bg-green-200 ml-auto" : "bg-gray-200"}`}
                            >
                                <div dangerouslySetInnerHTML={{ __html: marked(msg.content) }} />
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t flex items-center bg-white">
                        <input
                            type="text"
                            className="flex-1 p-2 border rounded-md focus:outline-none"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button className="ml-2 p-2 bg-green-400 rounded-md" onClick={sendMessage}>
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 