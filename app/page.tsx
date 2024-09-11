import Foundation from "./foundation";
import Stock from "./stock";
import Tableau from "./tableau";
import Footer from "./footer";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <main className="grid grid-cols-12 gap-14 p-24">
        <Foundation />
        <Stock />
        <Tableau />
      </main>
      <Footer />
    </div>
  );
}
