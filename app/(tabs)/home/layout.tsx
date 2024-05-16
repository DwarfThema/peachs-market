//해당 레이아웃은 모달을 만들기 위해 사용된다.
//Parallel Routes를 활용해서 모달을을 만들것이다.

//@modal이라고 되어있는 폴더가 Parallel Routes를 담당하고있다.
//@로 시작하는 폴더를 만들게 되면 Layout은 더이상 children만 prop으로 받지 않는다.
//@는 Slot이라 하는데 이를 받아서 레이아웃 위에 얹을 수 있다.

import React from "react";

export default function HomeLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
