"use server";

import db from "@/lib/db";

export async function getMoreProducts(page: number) {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    skip: page * 1, // 0*1 === 0 / 1*1 === 1 / 2*1 ===2 / 3*1===3 과같이 0을 표현 할 수 있음
    take: 1, // skpi과 take의 곱하는 숫자는 동일해야하고 해당 숫자가 한번에 로드할 때 보여줄 이미지 갯수이다.
    orderBy: {
      created_at: "desc", //asc면 예전꺼 부터 desc면 최근꺼부터 order하게된다.
    },
  });

  return products;
}
