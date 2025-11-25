import React from "react"

const Layout = ({children}:{children:React.ReactNode}) => {
  return (
    <main className="lg:pl-20 bg-[#0A0A0A] min-h-screen">
      <div className="max-w-5xl lg:mx-auto mx-4">
            {children}
      </div>
    </main>
  )
}

export default Layout