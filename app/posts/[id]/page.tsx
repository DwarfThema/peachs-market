import db from "@/lib/db";
import getSession from "@/lib/session";
import { formatToTimeAgo } from "@/lib/utils";
import { EyeIcon, HandThumbUpIcon } from "@heroicons/react/24/solid";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import { notFound } from "next/navigation";
import { HandThumbUpIcon as OutlineHandThumbUpIcon } from "@heroicons/react/24/outline";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import LikeButton from "@/components/like-button";

async function getPost(id: number) {
  //포스트를 보는 순간 이루어지는 액션에 대해서 다룰 수 있음
  //만약 유저가 잘못된 Id를 갖고왔을 때 에러가 나올 수 있으니 try catch 구문을 사용하자
  try {
    const post = await db.post.update({
      //update는 record를 수정하고 수정된 record를 return해준다.
      where: {
        id,
      },
      data: {
        //data는 수치를 변경할 때 사용
        views: {
          increment: 1,
          //view의 숫자가 뭔지 모르더라도 increment를 통해서 숫자 1을 더할 수 있음
        },
      },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  } catch (e) {
    return null;
  }
}

const getCachedPost = nextCache(getPost, ["post-detail"], {
  tags: ["post-detail"],
  revalidate: 60,
});

async function getLikeStatus(postId: number) {
  const session = await getSession();
  const isLiked = await db.like.findUnique({
    where: {
      id: {
        postId,
        userId: session.id!,
      },
    },
  });
  const likeCount = await db.like.count({
    // count는 post 생성된 갯수를 알려준다.
    where: {
      postId,
    },
  });
  return {
    likeCount,
    // findUnique로 찾은 결과에대해 유무의 여부를 Boolean으로 반환한다.
    isLiked: Boolean(isLiked),
  };
}

function getCachedLikeStatus(postId: number) {
  // postID를 받기 위해서 nextCache 단독으로 하지 않고 function으로 묶는다.
  const cachedOperation = nextCache(getLikeStatus, ["product-like-status"], {
    tags: [`like-status-${postId}`],
  });
  return cachedOperation(postId);
}

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const post = await getCachedPost(id);
  //getPost는 try catch구문을 썼기에 에러가 나오지 안흔다.
  // 다만 catch시 null을 반환하기에 NotFound로 이동 시킬 수있음
  if (!post) {
    return notFound();
  }

  const likePost = async () => {
    "use server";
    const session = await getSession();

    //try catch를 사용하는 이유는 만약 이미 특정 유저가 like를 눌렀는데 또 누르게 되면 Db에서 에러가 나오기 때문
    // like의 id를 @@id(name: "id", [userId, postId])로 짠 이유이다.
    try {
      await db.like.create({
        data: {
          postId: id,
          userId: session.id!,
        },
      });

      /* // 여기까지만하면 페이지를 계속 새로고침해줘야 내용을 볼 수 있다.
      // revalidatePath를 사용하면 url업데이트 반응에 따라 디비 업데이트를 전체 새로고침해준다.
      //하지만 이 방법은 무거운 방법
      // 또한 View또한 계속 늘어난다.
      revalidatePath(`/post/${id}`); */

      //path를 사용하는게 너무 무거우니 Tag를 달아줄것이다.
      // 그러기위해서는 위에 nextCache를 붙여준 곳에서 tag를 달아줘야한다.
      revalidateTag(`like-status-${id}`);
    } catch (e) {}
  };

  const dislikePost = async () => {
    "use server";

    //try catch를 사용하는 이유는 만약 이미 특정 유저가 like를 눌렀는데 또 누르게 되면 Db에서 에러가 나오기 때문
    // like의 id를 @@id(name: "id", [userId, postId])로 짠 이유이다.
    try {
      const session = await getSession();
      await db.like.delete({
        where: {
          id: {
            postId: id,
            userId: session.id!,
            //뒤에 !를 붙이면 해당 데이터가 없다고 생각해도 된다고 typescript에게 알려주는 것
          },
        },
      });
      //revalidatePath(`/post/${id}`);
      revalidateTag(`like-status-${id}`);
    } catch (e) {}
  };

  //isLike을 통해서 해당 포스트에 유저가 라이크를 눌렀는지 확인 가능
  const { likeCount, isLiked } = await getCachedLikeStatus(id);

  return (
    <div className="p-5 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Image
          width={28}
          height={28}
          className="size-7 rounded-full"
          src={post.user.avatar!}
          alt={post.user.username}
        />
        <div>
          <span className="text-sm font-semibold">{post.user.username}</span>
          <div className="text-xs">
            <span>{formatToTimeAgo(post.created_at.toString())}</span>
          </div>
        </div>
      </div>
      <h2 className="text-lg font-semibold">{post.title}</h2>
      <p className="mb-5">{post.description}</p>
      <div className="flex flex-col gap-5 items-start">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <EyeIcon className="size-5" />
          <span>조회 {post.views}</span>
        </div>
        <form action={isLiked ? dislikePost : likePost}>
          <LikeButton isLiked={isLiked} likeCount={likeCount} postId={id} />
        </form>
      </div>
    </div>
  );
}
