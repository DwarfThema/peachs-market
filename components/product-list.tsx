"use client";

import { InitialProducts } from "@/app/(tabs)/home/page";
import ListProduct from "./list-product";
import { useEffect, useRef, useState } from "react";
import { getMoreProducts } from "@/app/(tabs)/home/actions";

interface ProductListProbs {
  initialProducts: InitialProducts;
  // PromiseReturnType를 통해 getProducts의 타입을 자동으로 확인 할 수 있다.
}

export default function ProductList({ initialProducts }: ProductListProbs) {
  const [products, setProducts] = useState(initialProducts);
  //initialProducts 를통해 첫번째 데이터를 useState를 통해 세팅할 수 있음

  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);

  const [isLastPage, setIsLastPage] = useState(false);

  const trigger = useRef<HTMLSpanElement>(null);
  //useRef를 통해서 element의 object를 조작 할 수 있다.
  //getElementId를 하는것과 비슷

  //[1] 인피니티 스크롤 방식 로딩
  useEffect(() => {
    //해당 useEffect는 trigger Ref를 감지하고 업데이트하는 역할
    //page를 dependancy로 준 이유는 해당 useEffect는 page에 반응하기 때문

    const myObserver = new IntersectionObserver(
      //IntersectionObserver는 내가 기점으로 잡고 있는 ref나 obejct를 감지한다.
      async (
        entries: IntersectionObserverEntry[], //첫번째 arg는 observer가 감지한 elements다.
        observer: IntersectionObserver //두번째 arg는 observer 그자체이다.
      ) => {
        //myObserver가 내가 지정한 trigger을 감지하면 아래 콜백함수가 실행된다.
        console.log(entries);

        console.log(entries[0].isIntersecting);
        //감지한다면 true를, 아니라면 false를 리턴한다.

        const element = entries[0];
        if (element.isIntersecting && trigger.current) {
          //isIntersecting의 의미는 유저의 화면에 보인다면, 으로 받아드리면 된다.
          //element(ref)가 감지되고 ref가 있다면
          observer.unobserve(trigger.current);
          setIsLoading(true);
          // 먼저 감지를 멈추고 로딩을 시작한다.

          //이제 페이지네이션 시퀀스를 진행
          const newProducts = await getMoreProducts(page + 1);
          if (newProducts.length !== 0) {
            setPage((prev) => prev + 1);
            //서버에서도 +1했으니 클라이언트에서도 +1해서 서로 상태를 맞춘다.
            //대신 newProducts.length가 0이 아닐때만 실행하도록
          } else {
            setIsLastPage(true);
            //마지막 페이지라는걸 클라이언트에게 알려줄 수 있다.
          }

          setProducts((prev) => [...prev, ...newProducts]);
          //기존것과 새로운것을 합치게 됨

          setIsLoading(false);
        }
      },
      {
        threshold: 1.0, //trigger가 100퍼센트 다 보이면 작동한다는 뜻
        rootMargin: "0px 0px -100px 0px", //observer가 보고있는 element의 margin을 설정해 트리거 루트의 위치를 변경 가능
      }
    );

    if (trigger.current) {
      myObserver.observe(trigger.current);
      //trigger.current가 지금 존재한다면 옵저버는 observe를 진행한다.
    }

    return () => {
      //useEffect의 return은 cleanUpFunction 이라하며 ProductList컴포넌트가 unmount 되면 실행하게 된다.
      myObserver.disconnect();
      //만약 disconnect를 안한다면 계속 connect를 하고 있을것이다.
    };
  }, [page]);

  // [2] 클릭방식 로딩
  const onLoadMoreClick = async () => {
    setIsLoading(true);
    //로딩 시작

    const newProducts = await getMoreProducts(page + 1);
    if (newProducts.length !== 0) {
      setPage((prev) => prev + 1);
      //서버에서도 +1했으니 클라이언트에서도 +1해서 서로 상태를 맞춘다.
      //대신 newProducts.length가 0이 아닐때만 실행하도록
    } else {
      setIsLastPage(true);
      //마지막 페이지라는걸 클라이언트에게 알려줄 수 있다.
    }

    setProducts((prev) => [...prev, ...newProducts]);
    //기존것과 새로운것을 합치게 됨

    setIsLoading(false);
    //로딩 끝남
  };

  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}

      {!isLastPage ? (
        <span
          ref={trigger}
          className="text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
        >
          {isLoading ? "로딩 중" : "Load more"}
        </span>
      ) : (
        "no more items"
      )}

      {/* 
      버튼 방식
      {isLastPage ? (
        "no more items"
      ) : (
        <button
          onClick={onLoadMoreClick}
          disabled={isLoading}
          className="text-sm font-semibold bg-orange-500 w-fit mx-auto px-3 py-2 rounded-md hover:opacity-90 active:scale-95"
        >
          {isLoading ? "로딩 중" : "Load more"}
        </button>
      )} */}
    </div>
  );
}
