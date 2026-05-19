import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Entrant",
	description: "Entrant application",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="zh-CN" className="min-h-full bg-[#f6f8fb]">
			<body className="min-h-full bg-[#f6f8fb]">{children}</body>
		</html>
	);
}
