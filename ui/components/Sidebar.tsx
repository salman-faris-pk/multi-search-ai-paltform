"use client"

import React from "react"
import { useMediaQuery } from "usehooks-ts"
import Layout from "./Layout";




const Sidebar = ({children}:{children:React.ReactNode}) => {

    const isLarge=useMediaQuery("(min-width: 1024px)"); //Screen width is 1024px or MORE
  return (
    <aside>
        {isLarge ? (
            <div className="fixed inset-y-0 z-50 flex w-20 flex-col">


           </div>
        ): (
            <div className="fixed bottom-0 flex flex-row w-full z-50 items-center gap-x-6 bg-[#111111] px-4 py-4 shadow-sm">

            </div>
        )}
       

       {/* actual page contents here */}
       <Layout>
          {children}
       </Layout>
      
    </aside>
  )
}

export default Sidebar