import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/background.svg')] bg-cover bg-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2 md:pr-8 mb-8 md:mb-0">
            <div className="max-w-lg">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
                เพื่อเอกสารที่ง่ายกว่า <br /> ด้วย AI
              </h1>
              <p className="text-gray-600 mt-4 text-lg md:text-xl">
                เว็บที่ช่วยให้คุณสร้างเอกสารราชการได้ง่ายๆ เพียงไม่กี่คลิก <br />
                ประหยัดเวลาและเอกสารของคุณจะดูเป็นมืออาชีพมากขึ้น!✨
              </p>
              <div className="flex mt-6 space-x-4">
                <Link href="/documents">
                  <button className="bg-[#1d4ed8] hover:bg-yellow-500 text-white font-medium py-2 px-4 rounded-lg shadow-md">
                    เริ่มต้นสร้างเอกสาร
                  </button>
                </Link>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg shadow-md">
                  เรียนรู้เพิ่มเติม
                </button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="relative">
              <Image
                src="/img/ai-document-preview.png"
                alt="AI Document Preview"
                width={600}
                height={400}
                className=""
              />
              <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4">
                <Image
                  src="/img/female.png"
                  alt=""
                  width={800}
                  height={600}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}