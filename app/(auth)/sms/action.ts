"use server";

import { z } from "zod";
import validator from "validator";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import crypto from "crypto";
import getSession from "@/lib/session";
import { Twilio } from "twilio";

const phoneSchema = z
  .string()
  .trim()
  .refine(
    (phone) => validator.isMobilePhone(phone, "ko-KR"),
    "휴대전화 양식이 틀렸습니다."
  );
// isMobilePhone을 통해서 한국 전화번호만 유효하게 할 수 있음

async function tokenExists(token: number) {
  const exists = await db.sMSToken.findUnique({
    where: {
      token: token.toString(),
    },
    select: {
      id: true,
    },
  });

  // 토큰이 있는지 확인하면 booelan 으로 리턴한다.
  return Boolean(exists);
}

const tokenSchema = z.coerce
  .number()
  .min(100000)
  .max(999999)
  .refine(tokenExists, "This token does not exists.");
//input에 number을 넣어도 string으로 변하기 때문에 coerce를 넣어서 number로 변환할 수 있다.

interface ActionState {
  token: boolean;
}

export async function smsLogin(prevState: ActionState, formData: FormData) {
  const phone = formData.get("phone");
  const token = formData.get("token");

  if (!prevState.token) {
    const result = phoneSchema.safeParse(phone);
    if (!result.success) {
      return { token: false, error: result.error.flatten() };
    } else {
      // 토큰은 기본적으로 1개 갖고있어야 하기에 기존 토큰은 삭제한다.
      await db.sMSToken.deleteMany({
        where: {
          user: {
            phone: result.data, //phoneSchema의 결과는 phone number밖에 없으니 phone number를 찾아서 해당 유저의 토큰을 삭제한다.
          },
        },
      });

      // 새로운 토큰을 만든다.
      const token = await getToken();
      await db.sMSToken.create({
        data: {
          token,

          //토큰을 만든뒤 user와 반드시 연결시켜야한다.
          //하지만 token을 만드는 시점에 유저는 없을 수 있다.
          //그러게이 connectOrCreate를 사용해 connect하려하는 존재가 없으면 Create하도록 한다.
          user: {
            connectOrCreate: {
              where: {
                phone: result.data,
              },
              create: {
                username: crypto.randomBytes(10).toString("hex"),
                phone: result.data,
              },
            },
          },
        },
      });

      // 토큰을 twilio로 받는다.
      const client = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      await client.messages
        .create({
          body: `캐럿 마켓에 환영합니다 그렇게하도록 하세요 : ${token}`,
          from: process.env.TWILIO_PHONENUMBER!,
          to: result.data, //유저의 폰 넘버가 될것이다.
        })
        .then((message) => console.log(message.sid))
        .finally();

      return { token: true };
    }
  } else {
    const result = await tokenSchema.spa(token); //tokenSchema가 async 함수와 같이 돌아가니 spa를 사용해야한다.
    if (!result.success) {
      return {
        token: true,
        error: result.error.flatten(),
      };
    } else {
      // 토큰의 유저가 누군지 확인해야함
      const token = await db.sMSToken.findUnique({
        where: {
          token: result.data.toString(),
        },
        select: {
          id: true,
          userId: true,
        },
      });

      // 토큰이 일치하다 확인이 되면 유저 로그인 진행
      if (token) {
        const session = await getSession();

        session.id = token.userId;
        await session.save();
        await db.sMSToken.delete({
          where: {
            id: token.id,
          },
        });
      }

      redirect("/profile");
    }
  }
}

async function getToken() {
  //랜덤 숫자 생성
  const token = crypto.randomInt(100000, 999999).toString();
  const exists = await db.sMSToken.findUnique({
    where: {
      token,
    },
    select: {
      id: true,
    },
  });

  if (exists) {
    // 토큰은 모든 유저는 1개만 갖고있어야 하기 때문에 기존 토큰이 존재한다면 한번 더 크립토 랜덤을 돌린다.
    return getToken();
  } else {
    return token;
  }
}
