import ChatMessagesList from "@/components/chat-messages-list";
import db from "@/lib/db";
import getSession from "@/lib/session";
import { Prisma } from "@prisma/client";
import { notFound } from "next/navigation";

async function getRoom(id: string) {
  const room = await db.chatRoom.findUnique({
    where: {
      id,
    },
    include: {
      users: {
        select: { id: true }, //room안에 있는 실제 주인의 id를 갖고와서 검증할수있도록 해야함
      },
    },
  });

  if (room) {
    //room url만 있다고 룸에 들어오면 안되니, 이거를 막는 코드를 작성해주자.
    const session = await getSession();
    const canSee = Boolean(room.users.find((user) => user.id === session.id!));
    //find는 users라는 array안을 검색해서 찾게된다. session.id랑 일치하는 사람이 없으면 undefined

    if (!canSee) {
      return null;
    }
  }
  return room;
}

async function getMessages(chatRoomId: string) {
  //메세지를 불러오는 함수를 만들것이다.
  const messages = await db.message.findMany({
    where: {
      chatRoomId,
      //챗룸아이디를 받아서 불러온다.
    },
    select: {
      id: true,
      payload: true,
      created_at: true,
      userId: true,
      user: {
        select: {
          //유저안에서도 일부 정보만 갖고오려면 이렇게 하면된다.
          avatar: true,
          username: true,
        },
      },
    },
  });
  return messages;
}

async function getUserProfile() {
  //이건 캐싱으로 처리해도 되는 부분
  const session = await getSession();
  const user = await db.user.findUnique({
    where: {
      id: session.id!,
    },
    select: {
      username: true,
      avatar: true,
    },
  });
  return user;
}

export type InitialChatMessages = Prisma.PromiseReturnType<typeof getMessages>;
//getMessages의 return 타입을 프리즈마를 통해 정의할 수 있다.

export default async function ChatRoom({ params }: { params: { id: string } }) {
  const room = await getRoom(params.id);
  if (!room) {
    return notFound();
  }
  const initialMessages = await getMessages(params.id);
  //메세지를 만드는건 infiniteScroll 만드는 방식과 비슷하다
  //먼저 유저가 첨 들어왔을 때 볼수있는 메세지를 확인한다.

  const session = await getSession();
  //chatMessageList는 클라이언트 컴포넌트이기 때문에 위와같이 분리해서 사용한다.

  const user = await getUserProfile();
  if (!user) {
    return notFound();
  }

  return (
    <ChatMessagesList
      chatRoomId={params.id}
      userId={session.id!}
      username={user.username}
      avatar={user.avatar!}
      initialMessages={initialMessages}
    />
  );
}
