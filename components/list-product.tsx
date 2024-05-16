import { formatToTimeAgo, formatToWon } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ListProductProps {
  title: string;
  price: number;
  created_at: Date;
  photo: string;
  id: number;
}

export default function ListProduct({
  title,
  price,
  created_at,
  photo,
  id,
}: ListProductProps) {
  return (
    <Link href={`/products/${id}`} className="flex gap-5">
      <div className="relative size-28 rounded-md overflow-hidden">
        <Image
          fill
          src={`${photo}/width=100,height=100`}
          //cloud flare의 Flexible variants를 사용하면 위와같은 방법으로 사이즈를 정할수도 있음
          alt={title}
          className="object-cover"
          quality={1}
        />
        {/* fill 프로퍼티를 쓰면 부모를 가득채우게 된다 */}
        {/* quality를 사용해서 숫자를 넣으면 특정 퀄리티로 바꿀 수 있다. */}
      </div>
      <div className="flex flex-col gap-1 *:text-white">
        <span className="text-lg">{title}</span>
        <span className="text-sm text-neutral-500">
          {formatToTimeAgo(created_at.toString())}
        </span>
        <span className="text-lg font-semibold">{formatToWon(price)}원</span>
      </div>
    </Link>
  );
}
