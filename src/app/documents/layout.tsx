import Navbar from '@/components/Bar';

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>
        <Navbar />
        {children}
      </main>
    </>
  );
}