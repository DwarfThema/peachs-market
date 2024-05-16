import db from "@/lib/db";
import getSession from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  //docs의 2단계 시작
  const code = req.nextUrl.searchParams.get("code");
  //http://www.localhost:3000/github/complete?code=63501b398fae3289eb02
  //와같은 url로 리다이렉트 될 때 63501b398fae3289eb02를 따야한다.
  //해당 코드는 유한성을 갖는다. github의 경우는 10분뒤에 사라짐

  if (!code) {
    return notFound();
    //코드가 없으면 404를 리턴
  }

  const accessTokenParams = new URLSearchParams({
    //닥스에서 반드시 필요하다는
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenURL = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  //닥스에 따르면 위 링크로 POST를 보내야 한다고 함

  const accessTokenResponse = await fetch(accessTokenURL, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const { error, access_token } = await accessTokenResponse.json();
  //fetch를 했을 때 error와 result를 prop으로 받을 수 있다.
  //이를 활용해서 error와 success 처리를 하자.
  if (error) {
    //토큰이 만료됐을 때 등등에 에러가 발생한다.
    return new Response(null, {
      status: 400,
    });
  }

  //doc의 3단계 시작
  //액세스 토큰을 사용하여 API에 액세스
  //GET을 통해서 만들어진 access token을 헤더에 담아서 보내 반응을 받자.
  const userProfileResponse = await fetch(
    "https://api.github.com/user",
    // https://api.github.com/user 의 user는 scope에서 user를 받을수 있기에 받을 수 있다
    // eamil을 받으려면 user/emails 로 받아야함 <= 닥스를 참고해서 구조를 파악해야함
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-cache",
      //next.js에서는 get req를 보내면 해당 정보가 cache에 저장되기에 no-cache로 하자.
    }
  );
  const { id, avatar_url, login } = await userProfileResponse.json();
  //console.log(userProfileData); 로그해보면 어떤 정보가 오는지 확인 할 수 있다.

  const getUserEamilResponse = await GetUserEmailResponse(access_token);
  //함수를 통해 이메일 여부도 확인

  const user = await db.user.findUnique({
    //먼저 유저가 존재하는지 찾아야한다.
    where: {
      email: getUserEamilResponse?.email,
      //깃헙 아이디는 깃허브로 아이디를 만든 사람을 식별하기 위해 사용하는 것이다.
      //깃헙에서는 id를 int로 줬지만 우리는 github_id를 string으로 받기로 했다.
      //그러니 +""를 넣어서 string화 하자
    },
    select: {
      id: true,
    },
  });

  if (user) {
    //로그인 시퀀스
    const session = await getSession();
    session.id = user?.id;
    await session.save();

    //여기서 한번 깃허브 아이디로 업데이트 해줘야함.

    return redirect("/profile");
  }

  const newUser = await db.user.create({
    //유저를 만들기
    data: {
      github_id: id + "",
      avatar: avatar_url,
      username: `${login}#github${id}`,
      email: getUserEamilResponse?.email,
    },
    select: {
      id: true,
    },
  });

  //로그인 시퀀스
  const session = await getSession();
  session.id = newUser.id;
  await session.save();
  return redirect("/profile");
}

interface GithubEmailProps {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string;
}

async function GetUserEmailResponse(access_token: string) {
  const userEmailResponse = await fetch(
    "https://api.github.com/user/emails",
    // https://api.github.com/user 의 user는 scope에서 user를 받을수 있기에 받을 수 있다
    // eamil을 받으려면 user/emails 로 받아야함 <= 닥스를 참고해서 구조를 파악해야함
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-cache",
      //next.js에서는 get req를 보내면 해당 정보가 cache에 저장되기에 no-cache로 하자.
    }
  );

  const emails: GithubEmailProps[] = await userEmailResponse.json();

  if (emails && emails.length > 0) {
    return emails[0];
  } else {
    return null;
  }
}
