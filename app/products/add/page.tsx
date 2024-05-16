"use client";

import Button from "@/components/button";
import Input from "@/components/input";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { getUploadUrl, uploadProduct } from "./actions";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductType, productSchema } from "./schema";

export default function AddProduct() {
  const [preview, setPreview] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");
  const [photoId, setImageId] = useState("");

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) {
      return;
    }
    const file = files[0];
    const url = URL.createObjectURL(file);
    //클라이언트 상에서 특정 url을 만들어주도록 한다.
    //blob url을 만들어서 메모리를 차지함. 새로고침하면 만료됨
    setPreview(url);

    //클라우드 플레어에서 UploadURL을 만드는 시퀀스를 해야한다.
    //이를 a one time upload url이라고 하는데, 우리가 Onchang를 하는 순간 url을 만들도록 한다.
    //이를 통해 유저는 submit하는 순간 Url을 만들고 db에 업로드 하는게 아닌 이미 Url은 만들어 져있고 db만 올리면 되니 더 빠르게 느낀다.
    /* const response = await getUploadUrl();
    // console.log(response); //로그를 하면 다양한 정보를 확인 할 수 있다. */
    const { success, result } = await getUploadUrl();
    if (success) {
      const { id, uploadURL } = result;
      setUploadUrl(uploadURL);
      setImageId(id);
    }
  };

  /*  
    여기는 hookForm을 활용하는 방법인데, 
    11.8 RHF Refactor (17:19)에서 확인하자. 하다가 서버액션 다 사라지길래 진행안함

      //register는 React Hook Form을 활용해서 Form을 관리하는 방법이다.
  //Next14에 오고나서는 RHF를 사용하는건 선택 사항이나 사용하는 방법은 알아야 겠다.
  const { register, handleSubmit } = useForm<ProductType>({
    //z.infer를 이용해서 ProductType데이터를 갖고옴
    resolver: zodResolver(productSchema),
    //RHF과 hookFormResolver의 조합으로 zod의 내용을 갖고 올 수 있다.
  });
  const onValid = (data: ProductType) => {};

    const onSubmit = handleSubmit(async (data:ProductType) => {
    const file = formData.get("photo");
    if (!file) {
      return;
    }

    // 먼저 가상의 폼데이터에 저장해서 보내야한다.
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);

    //이제 Url으로 데이터를 보내자 fetch를 사용한다.
    const response = await fetch(uploadUrl, {
      method: "post",
      body: cloudflareForm,
    });
    console.log(await response.text());
    if (response.status !== 200) {
      //200이 아니라면 return이다. window.alter("안됐서요") 를 이용해서 경고를 줘도 된다.
      return;
    }

    //이제 클라우드 플레어 Image overview에 있던 Image Delivery URL를 이용해서 보내자.
    const photoUrl = `https://imagedelivery.net/zX2GiBzzHYsroLCJsWTCdA/${photoId}`;
    formData.set("photo", photoUrl);
    //위와같이 formData.set을 활용해서 데이터를 조작하자.

    return uploadProduct(_, formData);
    //마지막으로 실제로 있었던 데이터를 서버액션으로 보내자.
  })

  const action = async() =>{
    await onSubmit()
  } */

  //해당 방법은 useFormState 를 쓰는 방법이다.
  const interceptAction = async (_: any, formData: FormData) => {
    const file = formData.get("photo");
    if (!file) {
      return;
    }

    // 먼저 가상의 폼데이터에 저장해서 보내야한다.
    const cloudflareForm = new FormData();
    cloudflareForm.append("file", file);

    //이제 Url으로 데이터를 보내자 fetch를 사용한다.
    const response = await fetch(uploadUrl, {
      method: "post",
      body: cloudflareForm,
    });
    console.log(await response.text());
    if (response.status !== 200) {
      //200이 아니라면 return이다. window.alter("안됐서요") 를 이용해서 경고를 줘도 된다.
      return;
    }

    //이제 클라우드 플레어 Image overview에 있던 Image Delivery URL를 이용해서 보내자.
    const photoUrl = `https://imagedelivery.net/zX2GiBzzHYsroLCJsWTCdA/${photoId}`;
    formData.set("photo", photoUrl);
    //위와같이 formData.set을 활용해서 데이터를 조작하자.

    return uploadProduct(_, formData);
    //마지막으로 실제로 있었던 데이터를 서버액션으로 보내자.
  };
  const [state, action] = useFormState(interceptAction, null);
  //UseFormState를 사용하려면 serverAction의 서버 컴포넌트가 2개의 args를 가져야한다.
  //여기선 interceptAction을 했으니 interceptAction로 받자.
  //첫번째는 초기값(위에서는 null이다) 두번째는 formData를 받으면된다.

  return (
    <div>
      <form action={action} className="p-5 flex flex-col gap-5">
        <label
          htmlFor="photo" //htmlFor은 React에서만 사용한다.
          className="border-2 aspect-square flex items-center justify-center flex-col text-neutral-300 border-neutral-300 rounded-md border-dashed cursor-pointer bg-center bg-cover"
          style={{
            backgroundImage: `url(${preview})`,
          }}
        >
          {preview === "" ? (
            <>
              <PhotoIcon className="w-20" />
              <div className="text-neutral-400 text-sm">
                사진을 추가해주세요.
                {state?.fieldErrors.photo}
              </div>
            </>
          ) : null}
        </label>
        <input
          onChange={onImageChange}
          type="file"
          id="photo"
          name="photo"
          accept="image/*"
          className="hidden"
        />
        <Input
          name="title"
          required
          placeholder="제목"
          type="text"
          errors={state?.fieldErrors.title}
        />
        <Input
          name="price"
          type="number"
          required
          placeholder="가격"
          errors={state?.fieldErrors.price}
        />
        <Input
          name="description"
          type="text"
          required
          placeholder="자세한 설명"
          errors={state?.fieldErrors.description}
        />
        <Button text="작성 완료" />
      </form>
    </div>
  );
}
