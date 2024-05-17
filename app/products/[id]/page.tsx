import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToWon } from "@/lib/utils";
import { UserIcon } from "@heroicons/react/24/solid";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export const dynamicParams = true;
//기본적으로 true지만 false가 되면 정말 static페이지가 되어서 데이터를 갖고오질 못한다.

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  //findMany는 array를 반환한다.

  return products.map((product) => ({ id: product.id + "" }));

  /* [{ id: 4 }];
  //이렇게 모든 id에 쓰이는걸 4로 정해버릴수도 있다. */
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  //이런식으로하면 기존에 title을 얻는것과 별개로 또 데이터에 접근하게된다.
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }
  const product = await getCachedProduct(id);
  if (!product) {
    return notFound();
  }
  const isOwner = await getIsOwner(product.userId);

  const createChatRoom = async () => {
    "use server";
    const session = await getSession();

    const room = await db.chatRoom.create({
      data: {
        users: {
          connect: [
            {
              //첫번째ㅐ로 연결해야하는 유저는 해당 프로덕트의 주인임
              id: product.userId,
            },
            {
              //로그인한사람의 아이디
              id: session.id,
            },
          ],
        },
      },
    });

    redirect(`/chats/${room.id}`);
  };

  return (
    <div>
      <div className="relative aspect-square">
        <Image
          fill
          className="object-cover"
          src={`${product.photo}/public`}
          alt={product.title}
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <div className="fixed w-full bottom-0 left-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner ? (
          <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
            Delete product
          </button>
        ) : null}
        <form action={createChatRoom}>
          <button className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold">
            채팅하기
          </button>
        </form>
      </div>
    </div>
  );
}

async function getIsOwner(userId: number) {
  /* const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  //하지만 session을 사용한다는건 cookie를 사용한다는 뜻이기에 최적화되지 못한 방법이다.
  // 오너를 알기위해 반드시 DB를 봐야하니..
  // 그러니 나의 id를 미리 저장해 둔다면 어떨까?
  // 그게 generateStaticParams다. */

  return false;
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

async function getProductTitle(id: number) {
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });
  return product;
}

/* async function getAPIProduct(id: number) {
  fetch("https://api.com", {
    //api로 갖고올 경우 자동으로 caching 되니 아래와같이 하자.
    next: {
      revalidate: 60,
      tags: ["test"], //여기서 tag를 등록해서 사용할 수 있다.
    },
  });
} */

const getCachedProduct = unstable_cache(
  (id: number) => getProduct(id), //이렇게 쓰나 그냥 getProduct쓰나 똑같음
  ["product-detail"],
  {
    tags: ["product-detail"], //tag는 path와 다르게 unique할 필요는 없다.
  }
);
// tag로 정의하는건 path로 정의하는것과 다르게 특정 key가 들어가는것에 반응해서 새로 cache를 업데이트한다
// 약간 useEffect 느낌임. 데이터를 디테일하게 받는걸 조정하고싶을때 사용하면 좋음

const getCachedProductTitle = unstable_cache(
  (id: number) => getProductTitle(id),
  ["product-title"],
  {
    tags: ["product-title"],
  }
);
