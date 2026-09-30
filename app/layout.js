import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Ambaari HRMS",
  description: "Attendance, leave and payroll for your team",
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#0A1F4D", viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: "Figtree, sans-serif", fontSize: 14, borderRadius: 10, background: "#FFFFFF", color: "#0F1E3D", border: "1px solid #DFE6F2", boxShadow: "0 8px 24px -8px rgba(15,30,61,0.18)" },
              success: { iconTheme: { primary: "#1D5FD6", secondary: "#FFFFFF" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
