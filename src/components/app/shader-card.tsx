import { HeartIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import Link from "next/link"


export type ShaderCardProps = {
  url: string
  name: string
  username: string,
  like: number
  dislike: number
}

export const ShaderCard = (props: React.PropsWithChildren<ShaderCardProps>) => {
  return (
    <Link href={props.url ?? ""}>
      <div className='flex flex-col border rounded-md w-full overflow-hidden'>
        <img className="object-cover aspect-[16/9] overflow-hidden w-full" src="/transition_02-ezgif.com-optimize-1.gif" alt="" />
        <div className="p-4 font-bold">
          {props.name ?? "Untitled"}
        </div>
        <div className='mt-auto'>
        </div>
        <div className='border-t bg-card px-4 py-2 flex justify-between items-center'>
          <div>
            {props.username}
          </div>
          <div className="flex gap-4 text-xs">
            <div className="flex gap-1 items-center">
              <HeartIcon className="size-3"></HeartIcon>
              {props.like ?? 0}
            </div>
            <div className="flex gap-1 items-center">
              <ThumbsDownIcon className="size-3"></ThumbsDownIcon>
              {props.dislike ?? 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}