// 미들웨어는 서버 ----> 미들웨어 ---> 클라이언트 와 같은 방식으로 작동한다
// 서버와 클라 사이에서 작동해 다양한 방어막을 쳐준다.
// app폴더 밖에 만들며 middleware.ts 파일을 만들고 middleware함수를 제작하면됨
// 미들웨어가 실행되는곳을 정하고싶을 때는 req의 pathname을 활용하는 방법과 config의 matcher를 활용하는 방법이 있다.
// 복잡한 작업을 하고싶을때는 pathname을 이용해서 하면되고, 정규식으로 간단하게 하고싶다면 config를 사용하자
// 미들웨어는 edge runtime라는 라이트웨이 Node.js에서 발생한다.

import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  //위와같이 object 내부의 item을 파악하는 방법이 빠르고 라이트한 방법으로 검색하는 방법이다.
  //session id가 없는 로그인 안한 사람들이 갈 수 있는곳을 정하는 것
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
  "/github/start": true,
  "/github/complete": true,
};

export async function middleware(req: NextRequest) {
  const session = await getSession();
  const exists = publicOnlyUrls[req.nextUrl.pathname];
  //exists를 통해서 url의 boolean 여부를 확인 할 수 있다.
  if (!session.id) {
    if (!exists) {
      //로그인 정보도 없고, 위치가 public이 갈 수 없는 곳이라면
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    if (exists) {
      //로그인 정보가 있다면, 로그인 페이지가 아닌 서비스 홈페이지로 이동해야한다.
      return NextResponse.redirect(new URL("/home", req.url));
    }
  }

  /*   if (req.nextUrl.pathname === "/profile") {
    //pathname을 통해서 middleware가 실행되는곳을 정할 수 있다.
    return Response.redirect(new URL("/", req.url));
  } */
}

export const config = {
  //config안에서는 middleware이 실행되는 특정 구간을 정할 수 있다.
  //아래는 넥스트의 docs에서 나온 예시이다.
  //static, image, favicon등에서는 미들웨어를 사용하지 않는다는 것
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

/* export const config = {
  matcher: ["profile", "/about/:path*", "/dashboard/:path*"],
}; */
