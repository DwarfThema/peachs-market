"use client";

import { InitialChatMessages } from "@/app/chats/[id]/page";
import { saveMessage } from "@/app/chats/actions";
import { formatToTimeAgo } from "@/lib/utils";
import { ArrowUpCircleIcon } from "@heroicons/react/24/solid";
import { RealtimeChannel, createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

//슈퍼베이스 관련
const SUPABASE_PUBLIC_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJha2pxdXB3aXh2cXJvY3ZpYm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU5MTY1MDUsImV4cCI6MjAzMTQ5MjUwNX0.Po_PrmBm3boQBHbu2JB6SOS679047YFQRO6O_ZUAbr8";
const SUPABASE_URL = "https://rakjqupwixvqrocvibma.supabase.co";

interface ChatMessageListProps {
  initialMessages: InitialChatMessages;
  userId: number;
  chatRoomId: string;
  username: string;
  avatar: string;
}
export default function ChatMessagesList({
  initialMessages,
  userId,
  chatRoomId,
  username,
  avatar,
}: ChatMessageListProps) {
  const [messages, setMessages] = useState(initialMessages);
  //첫번째 메세지를 state에 넣는다.
  const [message, setMessage] = useState("");

  const channel = useRef<RealtimeChannel>();
  //useRef는 단순히 element를 attribute를 변경하는 용도가 아닌 위와같은 용도로도 사용된다.
  //그냥 특정 타입을 가진 하나의 박스를 만드는 것이다. 그걸 사용하면 되는것
  //약간 useState의 공간 만드는것과 비슷하다 생각하면됨
  //channel.current = ~~~ 와같은 방법으로 데이터를 변경한다.
  //위와같은 경우의 채널 정의는 처음 정의하는 client.channel부분에서 channel에 마우스를 올렸을때 나오는 값이다.
  //RealtimeChannel로 넣어주면된다.

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { value },
    } = event;
    setMessage(value);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    //해당 setMessages는 실제로 업로드 되었다고 착각하게 만드는 메세지다.
    // 메세지 안에 client 단으로 강제로 집어 넣게됨
    setMessages((prevMsgs) => [
      ...prevMsgs,
      {
        //initialMessages의 프랍들을 다 갖고와서 설정한다.
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          username,
          avatar,
        },
      },
    ]);

    //실제 메세지도 전달한다 SuperBase로 만든 channel로 보낸다.
    //https://supabase.com/docs/guides/realtime/broadcast#sending-broadcast-messages
    //위 링크를 확인해보면 사용방법에 대해서 자세히 나와있다.
    channel.current?.send({
      type: "broadcast",
      event: "dwarfAppMessages",
      payload: {
        //payload는 위에 setMessages에서 보낸 형식과 동일하게 보내고싶은 데이터를 보내면 된다.
        id: Date.now(),
        payload: message,
        created_at: new Date(),
        userId,
        user: {
          //이부분은 메세지에서 아바타와 유저네임을 사용하지 않기때문에 상관없기에 임의의 글자를 넣는다.
          username,
          avatar,
        },
      },
    });

    //이제 실제 db에 데이터를 넣어보자.
    await saveMessage(message, chatRoomId);

    setMessage("");
  };

  useEffect(() => {
    //npm i @supabase/supabase-js 를 통해 설치
    //https://supabase.com/docs/guides/realtime/broadcast 보며 진행
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
    // 클라이언트를 먼저만든다.

    channel.current = client.channel(`room-${chatRoomId}`);
    //유니크 네임을 가진 룸에 접근해야한다.
    //우리가 이상한 이름의 아이디(cuid방식으로 만든 id)를 가진 룸 아이디를 만든 이유
    channel.current
      .on(
        "broadcast", //브로드케스트는 : Send and receive messages using Realtime Broadcast
        {
          event: "dwarfAppMessages", //dwarfAppMessages라는 이름의 이벤트 키를 설정한다.
        },
        //3번째 arg에서 들어오는 payload를 받을 수 있다.
        //느낌을 확인해보고자 하면 payload를 로그해보자.
        (payload) => {
          setMessages((prevMsgs) => [...prevMsgs, payload.payload]);
        }
      )
      .subscribe(); //마지막은 구독을 눌러줘야 해당 서버와 연결된다.

    return () => {
      // 유저가 채널을 나갔을때 생기는 것들에 대해서 작성한다.
      channel.current?.unsubscribe();
    };
  }, [chatRoomId]);

  return (
    <div className="p-5 flex flex-col gap-5 min-h-screen justify-end">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-2 items-start ${
            message.userId === userId ? "justify-end" : ""
          }`}
        >
          {message.userId === userId ? null : (
            <Image
              src={message.user.avatar ? message.user.avatar : "/knife.jpeg"}
              alt={message.user.username}
              width={50}
              height={50}
              className="size-8 rounded-full"
            />
          )}
          <div
            className={`flex flex-col gap-1 ${
              message.userId === userId ? "items-end" : ""
            }`}
          >
            <span
              className={`${
                message.userId === userId ? "bg-neutral-500" : "bg-orange-500"
              } p-2.5 rounded-md`}
            >
              {message.payload}
            </span>
            <span className="text-xs">
              {formatToTimeAgo(message.created_at.toString())}
            </span>
          </div>
        </div>
      ))}
      <form className="flex relative" onSubmit={onSubmit}>
        <input
          required
          onChange={onChange}
          value={message}
          className="bg-transparent rounded-full w-full h-10 focus:outline-none px-5 ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-neutral-50 border-none placeholder:text-neutral-400"
          type="text"
          name="message"
          placeholder="Write a message..."
        />
        <button className="absolute right-0">
          <ArrowUpCircleIcon className="size-10 text-orange-500 transition-colors hover:text-orange-300" />
        </button>
      </form>
    </div>
  );
}
