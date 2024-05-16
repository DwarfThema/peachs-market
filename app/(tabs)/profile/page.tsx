import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";

async function getUser() {
  const session = await getSession();
  if (session.id) {
    const user = await db.user.findUnique({
      where: {
        id: session.id,
      },
    });
    if (user) {
      return user;
    }
  }
  notFound();
  //Next nevigation의 notFound를 하게되면 404페이지로 자동 이동을 하게된다.
  //user를 찾았는데 없다면 notFound를 이용해서 404페이지로 가게 만들자.
}

export default async function Profile() {
  const user = await getUser();

  const logOut = async () => {
    //인라인 서버 액션
    "use server";
    const session = await getSession();
    await session.destroy();
    //서버 자체를 터트려버린다.
    redirect("/");
  };

  return (
    <div>
      <h1>{user?.username}님 어서오세요!</h1>
      <form action={logOut}>
        {/* 로그인 관련해서 button의 OnClick을 사용하지 않는 이유는 onClick은 클라이언트 사이드에서 돌아가기 때문이다.
        서버에서 돌아가게 하려면 form을 이용해서 서버액션을 사용해서 로그아웃을 진행하자. */}
        <button>로그아웃</button>
      </form>
    </div>
  );
}
