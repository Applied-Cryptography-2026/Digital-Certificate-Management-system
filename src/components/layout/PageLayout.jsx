import { Sidebar } from './Sidebar'

export function PageLayout({ children, className }) {
  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <main className={`flex-1 p-8 lg:p-12 ${className}`}>
        {children}
      </main>
    </div>
  )
}
