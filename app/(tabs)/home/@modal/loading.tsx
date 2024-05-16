// 여기서 loading을 새로 해주는 이유는
// 만약 modal을 위한 로딩을 했을 때 modal을 위한 로딩이 아닌 기존 product list 확인을 위한 리스트가 나온다.
// 그러기위해 단독적으로 Loading을 만들 수 있고 null로 아무런 로딩이 안나오게 하면된다.

export default function Loading() {
  return null;
}
