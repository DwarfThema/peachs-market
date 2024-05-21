export default function Extras({ params }: { params: { myId: string[] } }) {
  console.log(params);
  //위와같이 로그를 하면 array로 params가 오는걸 확인 할 수 있음
  // .com/123/12/5/1/ 이런식으로 해도 params가 들어옴

  return <div>123</div>;
}
