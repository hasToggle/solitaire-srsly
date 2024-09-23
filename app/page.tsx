import Foundation from "./foundation";
import Stock from "./stock";
import Tableau from "./tableau";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="min-h-screen sm:pt-10">
      <main className="grid-cols-13 container mx-auto grid gap-1 p-2">
        <Foundation />
        <Stock />
        <Tableau />
      </main>
      <Footer />
    </div>
  );
}
