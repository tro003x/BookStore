export default function Footer() {
  return (
    <footer className="bg-[#1A1D1E] text-[#EFE9DC] py-6 mt-8">
      <div className="container mx-auto px-4 text-center text-sm">
        <p className="font-['Inter']">&copy; {new Date().getFullYear()} BoiStore. All rights reserved.</p>
      </div>
    </footer>
  );
}