"use server";

export async function handleForm(prevState: any, formData: FormData) {
  console.log("Initial Value is ", prevState);
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
}
