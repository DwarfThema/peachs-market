"use client";

import FormButton from "@/components/form-button";
import FormInput from "@/components/form-input";
import SocialLogin from "@/components/social-login";
import { redirect } from "next/navigation";
import { useFormState } from "react-dom";
import { handleForm } from "./action";

export default function LogIn() {
  const [state, action] = useFormState(handleForm, {
    initialValue: "테스트용 초기 값",
  } as any);
  // useFormStae는 form의 상태를 컨트롤 할 수 있는 react dom hook이다.
  // state는 현 상태를 보여주고, action은 form에 붙여주면된다.
  // 1st arg는 handleForm은 실제 실행시킬 실제 함수이며, 2nd arg는 initial value이다.
  // 느낌자체가 useState hook과 비슷하다.

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1>안녕하세요!</h1>
        <h2>Login with email and password.</h2>
      </div>
      <form action={action} className="flex flex-col gap-3">
        <FormInput
          name="email"
          type="email"
          placeholder="Email"
          required
          error={[]}
        />
        <FormInput
          name="password"
          type="password"
          placeholder="Password"
          required
          error={state?.error ?? []}
        />
        <FormButton text="Create Account" />
      </form>
      <SocialLogin />
    </div>
  );
}