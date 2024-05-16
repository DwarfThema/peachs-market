import { redirect } from "next/navigation";

export async function GET() {
  //docs의 1단계 시작
  //https://docs.github.com/ko/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
  const baseURL = "https://github.com/login/oauth/authorize";
  //깃헙 닥스에서 확인 가능
  const params = {
    //매개변수는 OAuth닥스에서 제시하는 이름 그대로 넣어줘야한다.
    client_id: process.env.GITHUB_CLIENT_ID!,
    scope: "read:user, user:email",
    //스코프는 우리가 유저에게 가입하려는 원하는 데이터가 뭔지 알려주는것
    //모두다 스코프라는 워딩을 쓰는건 아니다 페북의 경우는 Permission이라고 함
    //read:user는 단순히 유저의 데이터를 읽을수 있게 해주는것
    //user:email는 이메일 정보를 받을 수 있다.
    allow_signup: "true",
    //만약 로그인이 되어있지 않다면 해당 OAuth 도메인에서 가입할 수 있는 창을 보여준다.
    //false로 된다면 가입할수 있는 창을 보여주지 않는다. 그러니 그냥 true로 두면 됨
  };

  const formattedParams = new URLSearchParams(params).toString();
  //URL에 param을 심는 방법이다.
  //우리가 사이트에서 서치를 할 때 기존 url뒤에 서치 정보등을 담는것과 비슷
  //URLSearchParams로 만든뒤 string화 해줘서 사용하면된다.

  const finalUrl = `${baseURL}?${formattedParams}`;
  return redirect(finalUrl);
}
