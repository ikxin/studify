"use client";

import { Breadcrumb, Skeleton } from "@douyinfe/semi-ui";

export default function Home() {
	return (
		<>
			<Breadcrumb className="mb-4 sm:mb-6" routes={["首页", "当这个页面标题很长时需要省略", "上一页", "详情页"]} />
			<section className="min-h-[320px] flex-1 rounded-lg border border-[color:var(--semi-color-border)] bg-[color:var(--semi-color-bg-1)] p-5 sm:min-h-[376px] sm:p-8">
				<Skeleton placeholder={<Skeleton.Paragraph rows={2} />} loading active>
					<p>Hi, Bytedance dance dance.</p>
					<p>Hi, Bytedance dance dance.</p>
				</Skeleton>
			</section>
		</>
	);
}
