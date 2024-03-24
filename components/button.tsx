"use client";

import { useFormStatus } from "react-dom";

interface ButtonProps {
  text: string;
}

export default function Button({ text }: ButtonProps) {
  const { pending } = useFormStatus();
  //useFormStatus를 사용하면 해당 form의 진행 상황에 대해서 확인 할 수 있다.
  //useFormStatus는 form 그 자체에서 사용 할 수 없고 자식에서 사용 할 수 있다.

  return (
    <button
      disabled={pending}
      className="primary-btn h-10 disabled:bg-neutral-400 disabled:text-neutral-300 disabled:cursor-not-allowed"
    >
      {pending ? "로딩중..." : text}
    </button>
  );
}
