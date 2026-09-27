import { PublicNav } from "@/components/layout/PublicNav"
import { PublicFooter } from "@/components/layout/PublicFooter"
import { BrandedErrorPage } from "@/components/system/BrandedErrorPage"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#111111] flex flex-col">
      <PublicNav />
      <main id="main-content" className="flex-1 flex items-center justify-center">
        <BrandedErrorPage
          status={404}
          title="This page could not be found."
          description="The institutional record, program, or resource you requested may have been moved, removed, or is no longer available in the AIMETRA directory."
          showSuggestedLinks={true}
        />
      </main>
      <PublicFooter />
    </div>
  )
}
