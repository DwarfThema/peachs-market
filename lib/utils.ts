export function formatToTimeAgo(date: string): string {
  // 몇 시간 전에 만들어졌는지 확인 할 수 있도록 하는 기능
  const dayInMs = 1000 * 60 * 60 * 24;
  const time = new Date(date).getTime();
  const now = new Date().getTime();
  const diff = Math.round((time - now) / dayInMs);
  // 만들어진 시간과 지금 시간을 뺀다.

  const formatter = new Intl.RelativeTimeFormat("ko");
  //Intl의 RelativeTimeFormat을 사용하면 "-3"이라는 값이 "3일전"으로 변경됨

  return formatter.format(diff, "days");
  //2번째 arg는 어떤 기준으로 포메팅 할지 결정
}

export function formatToWon(price: number): string {
  return price.toLocaleString("ko-KR");
  //ko-KR을 사용하면 한국의 원 형태로 해당 글자를 변경한다.
}
