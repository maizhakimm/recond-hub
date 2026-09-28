import Link from "next/link";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container-page py-20 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-5xl">This page has driven off</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-2">The car or page you&rsquo;re looking for isn&rsquo;t here any more. Stock changes daily, so try a fresh search.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/cars" className="btn btn-primary">
            Browse cars
          </Link>
          <Link href="/find-me-a-car" className="btn btn-outline">
            Find me a car
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
