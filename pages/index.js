import Head from "next/head";
import HomePage from "../components/HomePage";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Run only on client side
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("studentName");
      const roll = localStorage.getItem("rollNumber");

      if (!name || !roll) {
        router.replace("/login"); // replace avoids back button issue
      }
    }
  }, [router]);

  return (
    <div>
      <Head>
        <title>Typing Test Website</title>
        <meta name="description" content="Typing Test App for Students" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HomePage />
      </main>
    </div>
  );
}
