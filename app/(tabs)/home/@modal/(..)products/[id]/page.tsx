// Intercepting Routes 의 사용이다.
// intercept Route는 기본적으로 Next에서 있는 nevigate(Link 등)의 이벤트를 가로챌 수 있다.
// 가로채서 내가 원하는 뷰를 보여주는 것이다. (URL은 그대로)

// 파일을 만들 때 (..) 의 의미는 우리가 Import를 할 때 사용하는 '../../' 와 마찬가지의 로직이다
// 우리는 (..)을 하는 이유는 지금 (..)products 폴더가 /home/(..)products 이기 때문에 실제 product폴더는 한단계 상위에 있다.
// '/home/(..)products'과 '/products'의 위치 관계를 생각해서 (..)을 작성하도록 하자.
// (.)는 현재 폴더 / (..)는 폴더 나가기 / (..)(..)는 폴더 2번 나가기로 / (...)는 root(app)폴더로 이용하기로 4가지를 사용할 수 있다.
// 그러니 사실(...) 을 사용해도 잘 돌아갈것이다. 이유는 products가 '/'에 있으니까

// 내가 이전에 home이라는 페이지에 있었고 products/[id] 라는 페이지로 이동하는 경우라면
// product/[id] 로 가기 전에 해당 페이지로 오게된다.
// Url로 들어온 사람은 이전 페이지가 Home이 아니기때문에 바로 product/[id] 로 가게됨
// 새로고침 하면 당연히 Products/[id] 로 가게 된다.

import ButtonX from "@/components/button-x";
import db from "@/lib/db";
import { PhotoIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { notFound, useRouter } from "next/navigation";

export default async function Modal({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getProduct(id);
  if (!product) {
    return notFound();
  }

  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <ButtonX />{" "}
      {/* 해당 Modal에서는 db를 찾아야해서 async여야한다. 그러니 use client를 사용해야하는 컴포넌트는 따로 분리한다.  */}
      <div className="max-w-screen-sm h-1/2  flex justify-center w-full">
        <div className="aspect-square relative bg-neutral-700 text-neutral-200  rounded-md flex justify-center items-center">
          <Image
            fill
            src={`${product.photo}/public`}
            className="object-cover h-fit w-fit"
            alt={product.title}
          />
        </div>
      </div>
    </div>
  );
}

async function getProduct(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });
  return product;
}
