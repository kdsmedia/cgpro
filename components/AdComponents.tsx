import React, { useEffect, useRef } from 'react';

// --- Monetag Banner Component ---
export const MonetagBanner: React.FC = () => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // #######################################################################
    // #               LOGIKA INJECT SCRIPT BANNER MONETAG                   #
    // #######################################################################
    // Jika script banner Anda berupa <script src="url"></script>,
    // Anda bisa mengaktifkan kode di bawah ini:
    
    /*
    if (bannerRef.current) {
        const script = document.createElement('script');
        script.src = "https://example.com/your-monetag-banner-script.js"; // Ganti URL Script
        script.async = true;
        // script.setAttribute('data-zone', '123456'); // Atribut tambahan jika ada
        bannerRef.current.appendChild(script);

        return () => {
            if (bannerRef.current) {
                bannerRef.current.innerHTML = ''; // Cleanup saat unmount
            }
        };
    }
    */
  }, []);

  return (
    <div className="w-full flex justify-center items-center my-4 overflow-hidden min-h-[50px]">
        {/* Container untuk Script Banner */}
        <div ref={bannerRef} id="monetag-banner-container" className="w-full flex justify-center">
            
            {/* 
                ----- PLACEHOLDER ----- 
                Hapus div di bawah ini jika script iklan sudah dipasang.
            */}
            <div className="w-full max-w-[320px] h-[50px] bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-[10px] text-center p-2 rounded">
                [AREA IKLAN BANNER MONETAG]
            </div>

        </div>
    </div>
  );
};

// --- Monetag Interstitial / Rewarded Logic ---
interface InterstitialProps {
  isOpen: boolean;
  onClose: () => void;
  onReward?: () => void;
}

export const MonetagInterstitial: React.FC<InterstitialProps> = ({ isOpen, onClose, onReward }) => {
  useEffect(() => {
    if (isOpen) {
        console.log("--- TRIGGERING NATIVE INTERSTITIAL (NO FRAME) ---");

        // #######################################################################
        // #          LOGIKA DIRECT LINK / NATIVE INTERSTITIAL                   #
        // #######################################################################
        // PENTING: Komponen ini TIDAK ME-RENDER UI (return null).
        // Iklan akan muncul sebagai Tab Baru (Direct Link) atau Overlay Native.
        // #######################################################################
        
        // --- OPSI 1: DIRECT LINK (Rekomendasi untuk Monetag) ---
        // Masukkan URL Direct Link dari dashboard Monetag Anda di bawah ini.
        // Uncomment kode berikut:
        
        /*
        const directLinkUrl = "https://tamber.com/your-direct-link"; // GANTI INI
        window.open(directLinkUrl, '_blank');
        */
        
        // -----------------------------------------------------------
        
        // --- LOGIKA CALLBACK STATE ---
        // Karena Direct Link membuka tab baru, kita beri jeda waktu simulasi
        // sebelum memberikan reward dan menutup status 'loading' iklan di app.
        
        const timer = setTimeout(() => {
            // 1. Berikan Reward
            if (onReward) {
                console.log("Reward diberikan");
                onReward();
            }
            
            // 2. Kembalikan State App (Tutup status iklan aktif)
            onClose(); 
        }, 3000); // Durasi simulasi (misal 3 detik user melihat iklan)

        return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, onReward]);

  // ###########################################################################
  // # CRITICAL: Return NULL agar TIDAK ADA FRAME/BOX yang muncul di Aplikasi. #
  // # Iklan tampil murni dari browser/window.open.                            #
  // ###########################################################################
  return null;
};