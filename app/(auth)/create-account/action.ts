"use server";

import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import getSession from "@/lib/session";

const checkUniqueUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });
  //username 찾기 시퀀스
  //select를 통해서 특정 정보만 받아서 데이터 캐싱수를 줄이자

  return !Boolean(user);
  //user의 상태를 boolean으로 변경해서 리턴
  //zod를 통해서 refine 진행
};

const checkoUniqueEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });
  //email 찾기 시퀀스

  return !Boolean(user);
  //user의 상태를 boolean으로 변경해서 리턴
};

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
        (username) => `${username}` /* is now 🍑member` */
        //transform을 사용하면 위와같이 object의 내용을 활용해서 변형을 할 수 있다.
        //nick name과같은 형식으로 사용할 수 있겠다.
      )
      .refine(
        checkUserName,
        "나쁜욕은 쓰면 안됩니다."
        //refine에서 false를 반환하면 2번째 arg가 에러 메세지로 나가게 된다.
      ),
    //.refine(checkUniqueUsername, "이미 존재하는 유저네임입니다.")
    email: z.string().email().trim().toLowerCase(),
    //.refine(checkoUniqueEmail, "이미 존재하는 이메일 주소 입니다.")
    password: z.string().min(PASSWORD_MIN_LENGTH).regex(
      PASSWORD_REGEX,
      PASSWORD_REGEX_ERROR
      //정규식을 사용하고 싶을때는 위와같이 regex를 사용하면된다.
    ),
    confirm_password: z.string().min(PASSWORD_MIN_LENGTH),
  })
  //superRefine은 폼의 전체의 context(ctx)를 이용해서 이슈를 만들어서 해당 이슈를 에러로 만들 수 있다.
  //이러한 ctx는 전체 form을 관리하기 쉽고, 아래와같이 순서를 정할 수 있다.
  //checkUniqueUsername나 email을 사용하지 않고 superRefine을 통해서 validation을 진행하는 이유는
  //username의 검증 이후에 fatal error를 줘서 데이터 주고받는 횟수를 줄이기 위함
  .superRefine(async ({ username }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 유저네임입니다.",
        path: ["username"],
        //path를 설정 안해주면 formError로 들어가게 된다.
        fatal: true,
      });
      return z.NEVER;
      //NEVER을 붙이게 되면 해당 refine뒤의 refine등과같은 검증은 모두 스킵한다.
      //유저 아이디 먼저 있는지 확인한뒤, 없는게 확인되면 password confirm을 진행한다.
    }
  })
  .superRefine(async ({ email }, ctx) => {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });
    if (user) {
      ctx.addIssue({
        code: "custom",
        message: "이미 존재하는 유저네임입니다.",
        path: ["email"],
        fatal: true,
      });
      return z.NEVER;
    }
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

  const result = await formSchema.spa(data);
  // 유저네임이 이미 있는지 확인해야하고
  // email이 이미 있는지 확인해야하고
  // unique한것들은 DB상태에서 체크할 수 밖에 없다. 그러기에 await와 Async를 한다.
  // safeParse가 아닌 spa(safeParseAsync)를 하면 async하는 함수들을 기다려 줬다가 확인이 완료될 때 까지 기다린다.
  // checkUniqueusername이나 email이 await가 필요하기 때문에 Async형태로 한다

  if (!result.success) {
    return result.error.flatten();
    //flatten을 사용하면 errors를 훨씬 관리하기 쉬워짐
    //로그해보면 object형태로 특정 필드의 에러가 array형태로 name : "에러메세지" 형태로 표현됨
  } else {
    // 1. 둘다 괜찮으면 passward를 해쉬해야하고
    // Hashing이란, hasing(1234)라는 함수가 만들어지면 완전 랜덤한 abjk3214k24jb2와 같은 해싱코드가 만들어지는것이다.
    // 하지만 반대로 hasing(abjk3214k24jb2)는 1234를 만들지 못한다. 그렇기 때문에 암호화가 됨
    // Npm i bcrypt / npm i @types/bcrypt 를 통해 모듈을 설치 가능

    const hashedPassward = await bcrypt.hash(result.data.password, 12);
    // 12는 Hash 알고리즘을 12번 돌리겠다는 뜻이다.
    const user = await db.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        password: hashedPassward,
      },
      select: {
        id: true,
      },
    });

    // 2. 아이디를 만들고 DB에 저장진행
    // npm i iron-session을 통해 쿠키관리 도구인 Iron-session을 깔자
    // next의 말도안되는 기능인 cookies함수를 넣어서 쿠키 정보를 받자.
    const session = await getSession();

    session.id = user.id;
    await session.save();
    //쿠키의 기준은 user의 id로 만들어지기 때문에 쿠키의id와 유저의 id를 일치시킨다.
    //이후 password를 통해서 브라우저를 통해서 보이는 쿠키코드는 이상한 코드로 만들어지게 됨
    //이 이상한 코드로 특정 유저가 누군지 확인 할 수 있게되는 것이다.

    // 3. 자동 로그인 되도록 만들고 "/home"으로 이동
    redirect("/profile");
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
