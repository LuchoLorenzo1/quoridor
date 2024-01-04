import { UserData } from "@/app/game/[gameId]/page";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { FaEye } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";

interface Message {
  text: string;
  name?: string;
}

const Chat = ({
  socket,
  whitePlayerData,
  blackPlayerData,
  viewers,
  className,
}: {
  socket: Socket;
  whitePlayerData: UserData;
  blackPlayerData: UserData;
  viewers: number;
  className?: string;
}) => {
  const session = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("chatMessage", (t: string) => {
      const [name, ...tx] = t.split(":");
      console.log(name, tx.join(":"));
      setMessages((m) => [...m, { text: tx.join(":"), name }]);
    });

    socket.on("chat", (m: String[]) => {
      const ms: Message[] = [];
      m.forEach((t) => {
        const [name, text] = t.split(":");
        ms.push({ name, text });
      });
      setMessages(ms);
    });

    socket.on("leftChat", (player: number) => {
      setMessages((m) => [
        ...m,
        {
          text: `${
            player == 0 ? whitePlayerData.name : blackPlayerData.name
          } left the chat`,
        },
      ]);
    });

    socket.emit("getChat");

    return () => {
      socket.off("chatMessage");
      socket.off("chatMessage");
      socket.off("chat");
    };
  }, []);

  const sendMessage = () => {
    const name = session.data?.user.name;
    if (!text || session.status != "authenticated" || !name) return;
    setMessages((m) => [...m, { text, name }]);
    socket.emit("chatMessage", text);
    setText("");
  };

  useEffect(() => {
    messagesRef.current?.scrollTo({
      behavior: "smooth",
      top: messagesRef.current.scrollHeight + 50,
    });
  }, [messages]);

  return (
    <div className={twMerge("relative w-full h-full flex flex-col", className)}>
      {viewers > 0 && (
        <div className="absolute text-stone-800 right-1 top-0 flex items-center gap-1 group hover:text-stone-900">
          <div className="p-1 text-sm hidden absolute top-5 right-0 bg-stone-800 text-stone-200 group-hover:inline-block">
            <h1 className="whitespace-nowrap">users watching the match</h1>
          </div>
          <FaEye />
          <h2 className="select-none">{viewers}</h2>
        </div>
      )}
      <div
        ref={messagesRef}
        className="h-64 bottom-0 w-full bg-stone-300 border-b-2 border-stone-800 overflow-y-scroll p-2 no-scrollbar"
      >
        {messages.map((m, i) => {
          return (
            <p key={i} className="text-stone-600 text-sm break-words">
              {m.name && (
                <span
                  className={twMerge(
                    "font-black",
                    m.name == blackPlayerData.name
                      ? "text-stone-800"
                      : m.name == whitePlayerData.name
                        ? "text-stone-600"
                        : "text-stone-700",
                  )}
                >
                  {m.name}
                  {": "}
                </span>
              )}
              {m.text}
            </p>
          );
        })}
      </div>
      <div className="h-[10%] w-full flex flex-col gap-2">
        <div className="flex">
          <input
            className="w-3/4 outline-none px-0.5 bg-stone-300"
            type="text"
            onChange={(e) => setText(e.target.value)}
            value={text}
            onKeyDown={(event) => {
              if (event.key == "Enter") sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="w-1/4 border-l-2 border-l-stone-800 bg-stone-600 hover:bg-stone-700 flex justify-center items-center active:focus:bg-stone-800 text-stone-200 outline-none"
          >
            <IoMdSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
