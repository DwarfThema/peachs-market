import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

interface SessionContent {
  id?: number;
}

export default function getSession() {
  //ironSession는 getIronSession이 session 정보를 쿠키에 저장하는 방식이다.
  //이를 사용하지 않으면 따로 db에 session Table을 만들어서 세션을 관리해야한다.
  //이렇게되면 로그인 할 때 마다 session table을 봐야해서 db사용량이 더 증가할 수 밖에 없음.
  //하지만 irsonSession은 cookie에 저장된 암호화된 password를 통해서 유저의 Id를 찾을 수있는 방법이기에 훨씬 효율적이다.

  return getIronSession<SessionContent>(cookies(), {
    cookieName: "delicious-carrot",
    //쿠키 네임은 어떻게 지어도 상관없지만 네이버는 "NID_AUT"라는 네임을 갖고있다.
    // 유튜브는 "LOGIN_INFO"라고 이름을 지었다.
    // 노마드 코더는 "sessionid"이다.
    password: process.env.COOKIE_PASSWORD!,
    // password는 쿠키화 해줄 때 패스워드를 변환해주는 특정 알고리즘 코드를 넣어서 변환시킨다.
    // 그렇기 때문에 env에서 관리해 아무도 확인 못하도록 해야함.
  });
}
