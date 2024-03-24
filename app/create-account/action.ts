"use server";

import { z } from "zod";

const passwordRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);

const checkUserName = (username: string) =>
  !username.includes("나쁜욕") ? true : false;

const checkPassword = ({
  password,
  confirm_password,
}: {
  password: string;
  confirm_password: string;
}) => password === confirm_password;

const formSchema = z
  .object({
    username: z
      .string({
        invalid_type_error: "아이디는 반드시 텍스트를 포함해야합니다.",
        required_error: "해당 필드는 필수입니다.",
      })
      .min(3, "너무 짧습니다. 3자 이상으로 쓰세요")
      .max(10, "너무 깁니다. 10자 아래로 쓰세요")
      .toLowerCase()
      //모든 대문자를 소문자로 바꿔줌
      .trim()
      //띄어쓰기가 있다면 trim으로 삭제해줌
      .transform(
        (username) => `${username} is now 🍑member`
        //transform을 사용하면 위와같이 object의 내용을 활용해서 변형을 할 수 있다.
        //nick name과같은 형식으로 사용할 수 있겠다.
      )
      .refine(
        checkUserName,
        "나쁜욕은 쓰면 안됩니다."
        //refine에서 false를 반환하면 2번째 arg가 에러 메세지로 나가게 된다.
      ),
    email: z.string().email().trim().toLowerCase(),
    password: z.string().min(10).regex(
      passwordRegex,
      "비밀번호는 반드시 대소문자와 숫자, 특수문자를 포함해야 합니다."
      //정규식을 사용하고 싶을때는 위와같이 regex를 사용하면된다.
    ),
    confirm_password: z.string().min(10),
  })
  .refine(checkPassword, {
    message: "비밀번호와 비밀번호 확인이 일치하지 않습니다.",
    path: ["confirm_password"],
    //Schema의 모든 오브젝트를 사용하려면 오브젝트 자체에 refine을 걸면된다.
    //위와같이 path를 정해주면 해당하는 form이름에 붙어서 error를 표시한다.
  });
//zod를 폼데이터와 같은 오브젝트로 할당하려면 위와같이 하면된다.

const usernameSchema = z.string().min(3).max(10);
// zod를 단독으로 쓸 때는 위와같이 사용한다.

export async function createAccount(prevdata: any, formData: FormData) {
  const data = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  };

  const result = formSchema.safeParse(data);
  if (!result.success) {
    return result.error.flatten();
    //flatten을 사용하면 errors를 훨씬 관리하기 쉬워짐
    //로그해보면 object형태로 특정 필드의 에러가 array형태로 name : "에러메세지" 형태로 표현됨
  } else {
    console.log(result.data);
  }

  /*   try {
    formSchema.safeParse(data);
    //safeParse를 사용하면 Error를 던지지 않는다.

    formSchema.parse(data);
    //parse는 client에서 error를 던진다.

    //usernameSchema.parse(data.username)
    //단독으로 사용하려면 위와같이 하면된다.
  } catch (e) {
    console.log(e);
  } */
}
