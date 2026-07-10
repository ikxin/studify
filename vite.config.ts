import { cloudflare } from "@cloudflare/vite-plugin";
import rsc from "@vitejs/plugin-rsc";
import { defineConfig } from "vite";
import vinext from "vinext";

export default defineConfig({
	build: {
		rolldownOptions: {
			onLog(level, log, defaultHandler) {
				if (
					level === "warn" &&
					log.code === "EVAL" &&
					/(?:^|[\\/])lottie-web(?:[\\/]|$)/.test(log.id ?? "")
				) {
					return;
				}

				defaultHandler(level, log);
			},
		},
	},
	plugins: [
		vinext({ rsc: false }),
		rsc({
			entries: {
				rsc: "virtual:vinext-rsc-entry",
				ssr: "virtual:vinext-app-ssr-entry",
				client: "virtual:vinext-app-browser-entry",
			},
		}),
		cloudflare({
			viteEnvironment: {
				name: "rsc",
				childEnvironments: ["ssr"],
			},
		}),
	],
});
