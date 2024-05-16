// 해당 파일은 Parallel Routes를 활용해서 모달을을 만들기 위한 Default 파일이다.
// defalut 파일은 고유한 파일이다. 즉, 파일명은 바뀌지 않는다.

// Home의 layout을 확인하면 children과 modal을 같이 보고 있는걸 확인 할 수 있다.
// 하지만우리는 Home으로 왔을 때 modal을 보고싶은게 아니고 product를 눌렀을때만 보고싶다.
// 그러기에 Home에는 기본적으로 어떤걸 나타내주는지 명시해주는 default를 넣어줘야한다.
// Return을 Null로하면 아무것도 보이지 않으니 기본은 아무것도 안보인다는걸 명시해주자.

export default function Default() {
  return null;
}
