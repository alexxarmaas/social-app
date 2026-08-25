import RecceMindConsole from "@/components/reccemind/RecceMindConsole";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ stage?: string | string[] }>;
};

export default async function RecceMindPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stage = Array.isArray(params.stage) ? params.stage[0] : params.stage;
  return <RecceMindConsole initialStageId={stage?.slice(0, 80) || null} />;
}
