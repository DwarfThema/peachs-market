import { InputHTMLAttributes } from "react";

interface InputProps {
  name: string;
  errors?: string[];
}

export default function Input({
  name,
  errors = [],
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  // "use server"를 활용해 formData를 받기 위해서는 반드시 "name"을 넣어줘야한다.
  // server단에서 해당 Input을 구분 하기 위해서는 반드시 "name" prop 이 있어야 하기 때문이다.
  //  InputHTMLAttributes를 넣으면 type, name, placeholder, required등에 대한 타입 정의를 할 필요가 없다.

  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        {...rest}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none p-3 placeholder:text-neutral-400"
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
}
