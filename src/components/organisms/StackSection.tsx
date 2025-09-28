import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FaFileArchive,
  FaFileWord,
  FaFileExcel,
  FaFileInvoice,
  FaFileUpload,
  FaFileVideo,
  FaFileAudio,
  FaFileCsv,
  FaGoogleDrive,
  FaDropbox,
  FaFilePdf,
  FaFileDownload,
  FaFileExport,
  FaFilePowerpoint,
  FaFileSignature,
  FaFileMedical,
} from "react-icons/fa";

const iconConfigs = [
  { Icon: FaGoogleDrive, color: "#61DAFB" },
  { Icon: FaFileArchive, color: "#FF9900" },
  { Icon: FaDropbox, color: "#2496ED" },
  { Icon: FaFileWord, color: "#339933" },
  { Icon: FaFileDownload, color: "#000000" },
  { Icon: FaFilePowerpoint, color: "#000000" },
  { Icon: FaFileExport, color: "#764ABC" },
  { Icon: FaFileSignature, color: "#3178C6" },
  { Icon: FaFileExcel, color: "#181717" },
  { Icon: FaFileInvoice, color: "#1DA1F2" },
  { Icon: FaFileUpload, color: "#0077B5" },
  { Icon: FaFileVideo, color: "#E1306C" },
  { Icon: FaFileAudio, color: "#DB4437" },
  { Icon: FaFileCsv, color: "#000000" },
  { Icon: FaFileMedical, color: "#1877F2" },
];

export default function StackSection() {
  const orbitCount = 3;
  const orbitGap = 8; // rem between orbits
  const iconsPerOrbit = Math.ceil(iconConfigs.length / orbitCount);

  return (
    <section className="relative max-w-6xl mx-auto pl-10 flex items-center justify-between h-[30rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-black overflow-hidden rounded-3xl ">
      {/* Left side: Heading and Text */}
      <div className="w-1/2 z-10">
        <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          Học tập và ôn luyện với tại liệu có sẵn của bạn
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-lg">
          Kết nối tài liệu của bạn từ Google Drive, Dropbox, hoặc tải lên trực
          tiếp để bắt đầu hành trình học tập cá nhân hóa.
        </p>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="https://ruixen.com" target="_blank">
              {" "}
              Bắt đầu ngay
            </Link>
          </Button>
          <Button variant="outline">Xem thêm</Button>
        </div>
      </div>

      {/* Right side: Orbit animation cropped to 1/4 */}
      <div className="relative w-1/2 h-full flex items-center justify-start overflow-hidden">
        <div className="relative w-[50rem] h-[50rem] translate-x-[30%] flex items-center justify-center">
          {/* Center Circle */}
          <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 shadow-lg flex items-center justify-center">
            <FaFilePdf className="w-12 h-12 text-red-400" />
          </div>

          {/* Generate Orbits */}
          {[...Array(orbitCount)].map((_, orbitIdx) => {
            const size = `${12 + orbitGap * (orbitIdx + 1)}rem`; // equal spacing
            const angleStep = (2 * Math.PI) / iconsPerOrbit;

            return (
              <div
                key={orbitIdx}
                className="absolute rounded-full border-2 border-dotted border-gray-300 dark:border-gray-600"
                style={{
                  width: size,
                  height: size,
                  animation: `spin ${12 + orbitIdx * 6}s linear infinite`,
                }}>
                {iconConfigs
                  .slice(
                    orbitIdx * iconsPerOrbit,
                    orbitIdx * iconsPerOrbit + iconsPerOrbit
                  )
                  .map((cfg, iconIdx) => {
                    const angle = iconIdx * angleStep;
                    const x =
                      Math.round((50 + 50 * Math.cos(angle)) * 100) / 100;
                    const y =
                      Math.round((50 + 50 * Math.sin(angle)) * 100) / 100;

                    return (
                      <div
                        key={`${orbitIdx}-${iconIdx}`}
                        className="absolute bg-white dark:bg-gray-800 rounded-full p-1 shadow-md"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          transform: "translate(-50%, -50%)",
                        }}>
                        {cfg.Icon ? (
                          <cfg.Icon
                            className="w-8 h-8"
                            style={{ color: cfg.color }}
                          />
                        ) : (
                          <img
                            src={cfg.img}
                            alt="icon"
                            className="w-8 h-8 object-contain"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </section>
  );
}
