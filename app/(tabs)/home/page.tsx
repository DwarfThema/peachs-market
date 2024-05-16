import ListProduct from "@/components/list-product";
import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Prisma } from "@prisma/client";
import { revalidatePath, unstable_cache } from "next/cache";
import Link from "next/link";

/* export const dynamic = "force-dynamic";
//dynamic을 사용하면 해당 페이지는 static이 아닌 dynamic이 된다.
//"auto"가 기본값이고 이랬을 경우에는 caching을 최대한으로 한다는 뜻 */

export const revalidate = 60;
//revalidate를 하면 다시 static 페이지로 돌아가고 60초마다 캐시데이터를 업데이트함

export default async function Products() {
  const initialProducts = await getCachedProducts();
  //cache를 통해 데이터를 받았기네 DB에 더 접속하지 않는다.

  const revalidate = async () => {
    "use server";
    revalidatePath("/home"); //path는 tag와 다르게 유일무이해야한다.
  };
  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      <form action={revalidate}>
        <button>Revalidate</button>
      </form>
      <Link
        href="/products/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}

const getCachedProducts = unstable_cache(
  getInitialProducts,
  ["home-products"], // 해당 key를 등록한다 이건 유니크해야한다.
  {
    tags: ["product", "home"], // 태그를 등록한다. 이건 유니크할 필요는 없다.
  }

  /* { revalidate: 60 } // 60초 기준으로 새로고침에 반응해 업데이트를 한다. 60초 이전에는 예전 데이터를 보여줌 */
);
//해당 방법을 통해서 getInitialProducts의 return값을 next.js app의 cache에 저장한다.
//이런 방법으로 데이터베이스 접속 수를 줄인다.
// revalidate 시계를 돌려서 자동 업데이트 주기를 만들어준다.

async function getInitialProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    /* take: 1, */
    orderBy: {
      created_at: "desc", //asc면 예전꺼 부터 desc면 최근꺼부터 order하게된다.
    },
  });

  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;
// PromiseReturnType를 통해 getInitialProducts의 타입을 자동으로 확인 할 수 있다.
