
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export default function App({ Component, pageProps }) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />
    </ConvexProvider>
  );
}
