interface FormInputProps {
  type: string;
  placeholder: string;
  required: boolean;
  error: string[];
  name: string;
}

export default function FormInput({
  name,
  type,
  placeholder,
  required,
  error,
}: FormInputProps) {
  // "use server"를 활용해 formData를 받기 위해서는 반드시 "name"을 넣어줘야한다.
  // server단에서 해당 Input을 구분 하기 위해서는 반드시 "name" prop 이 있어야 하기 때문이다.

  return (
    <div className="flex flex-col gap-2">
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="bg-transparent rounded-md w-full h-10 focus:outline-none ring-2 focus:ring-4 transition ring-neutral-200 focus:ring-orange-500 border-none p-3 placeholder:text-neutral-400"
      />
      {error.map((error, index) => (
        <span key={index} className="text-red-500 font-medium">
          {error}
        </span>
      ))}
    </div>
  );
}
