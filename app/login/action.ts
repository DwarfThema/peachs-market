"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
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

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
  } else {
    console.log(result.data);
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
