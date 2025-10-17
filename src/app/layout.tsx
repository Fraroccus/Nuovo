export const metadata = {
  title: 'Warehouse Inventory Management API',
  description: 'Backend APIs for warehouse, shelf, and inventory management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
