// app/(frontend)/layout.tsx
import Header from '@/components/home/Header'
import Footer from '@/components/home/Footer'

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="pt-20 flex-grow"> {/* <--- Change to flex-grow only */}
        {children}
      </main>
      <Footer />
    </>
  )
}