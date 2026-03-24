import { SiteHeader } from "@/components/app/site-header"
import React from "react"

export default ({ children }: React.PropsWithChildren) => {
  return <>
    <div className="mx-auto box-content max-w-[1104px] 3xl:max-w-[1104px]">
      <SiteHeader></SiteHeader>
      <div className='lg:max-w-[calc(100%-316px)] 3xl:max-w-[1104px] mt-4 px-7'>
        {children}
      </div>
    </div>
  </>
}