import { z } from "zod";

export const productSchema = z.object({
  photo: z.string({
    required_error: "Photo is required",
  }),
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string({
    required_error: "Description is required",
  }),
  price: z.coerce.number({
    //기본적으로 Form으로 날라온 숫자는 모두 string으로 변환되니 coerce를 이용해서 number로 변환한다.
    required_error: "Price is required",
  }),
});

export type ProductType = z.infer<typeof productSchema>;
// z.infer는 zod에 대한 타입을 자동으로 갖고와줄 수 있다.
// 이걸활용해서 RHF에 데이터를 넘겨 자동 완성을 시켜줄 수 있음
