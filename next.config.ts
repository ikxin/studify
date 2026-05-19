import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@douyinfe/semi-ui", "@douyinfe/semi-icons", "@douyinfe/semi-illustrations"],
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
