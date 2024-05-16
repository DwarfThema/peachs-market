"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import getSession from "@/lib/session";
import { redirect } from "next/navigation";

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  return Boolean(user);
};

const formSchema = z.object({
  email: z
    .string()
    .email()
    .trim()
    .toLowerCase()
    .refine(
      checkEmailExists,
      "해당 이메일주소를 가진 아이디가 존재하지 않습니다."
    ),
  password: z
    .string({ required_error: "비밀번호를 입력하세요" })
    .min(PASSWORD_MIN_LENGTH)
    .regex(
      PASSWORD_REGEX,
      PASSWORD_REGEX_ERROR
      //정규식을 사용하고 싶을때는 위와같이 regex를 사용하면된다.
    ),
});

export async function login(prevState: any, formData: FormData) {
  const data = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = await formSchema.spa(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    //1. email과 함께 유저를 찾아야한다. => zod에서 진행
    //2. 만약 유저가 찾아진다면, 패스워드 해시를 체크해야한다.
    const user = await db.user.findUnique({
      where: {
        email: result.data.email,
      },
      select: {
        id: true,
        password: true,
      },
    });

    const ok = await bcrypt.compare(result.data.password, user!.password ?? "");
    // user!.password가 null이 아니라면 ""로 비교하라 라는 의미 => ""로 비교하게 되면 반드시 false가 나온다.
    console.log(ok);

    //3. 패스워드 해시가 맞다 확인되면 로그인
    if (ok) {
      const session = await getSession();
      session.id = user?.id;
      await session.save();
      redirect("/profile");
    } else {
      return {
        fieldErrors: {
          password: ["비밀번호가 틀렸습니다."],
          email: [],
          //email까지 해주는 이유는 fieldErrors의 기본 폼이 email도 있어야 하기 때문
          //page단에서 zod가 validation을 체크할 때 email에 대한 오류가 없다라는걸 명시해줘야 page의 type오류가 생기지 않는다.
        },
      };
    }

    // redirect "/Profile"
  }

  /*   console.log("Initial Value is ", prevState);
  // useFormState를 사용하면 arg가 2개는 있어야한다.
  // 일반적으로 preveState를 넣고 이후는 formData를 넣는다.

  await new Promise((resolve) => setTimeout(resolve, 2000));
  //테스트를 위한 setTimeout

  console.log(formData.get("email"), formData.get("password"));
  //formData에서 get을 통해서 데이터를 받을 수 있다
  //해당 데이터를 받으려면 반드시 Input단에서 Name을 넣어야한다.

  // redirect("/"); 
  
  return {
    error: ["Error!", "password Too short "],
    //error는 테스트로 넣었다.
  };
  */
}
