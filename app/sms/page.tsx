"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import SocialLogin from "@/components/social-login";
import { useFormState } from "react-dom";
import { smsLogin } from "./action";

const initialState = {
  token: false,
  error: undefined,
};

export default function SMSLogin() {
  const [state, dispatch] = useFormState(smsLogin, initialState);

  return (
    <div className="flex flex-col gap-10 py-8 px-6">
      <div className="flex flex-col gap-2 *:font-medium">
        <h1>SMS Login</h1>
        <h2>Verify your phone number</h2>
      </div>
      <form action={dispatch} className="flex flex-col gap-3">
        {state.token ? (
          //token의 초기값을 false로 정해서 토큰을 보내지 않았으면 안보이도록 설정
          <Input
            name="token"
            type="number"
            placeholder="Verification Code"
            required
            min={100000}
            max={999999}
          />
        ) : (
          <Input
            name="phone"
            type="text"
            placeholder="Phone number"
            required
            errors={state.error?.formErrors}
          />
        )}
        <Button text={state.token ? "인증번호 확인" : "인증번호 보내기"} />
      </form>
    </div>
  );
}
