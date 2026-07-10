export interface VercelStats {
  pageviews: number;
  visitors: number;
}

export async function getVercelStats(): Promise<VercelStats | null> {
  const token = process.env.VERCEL_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;

  if (!token || !projectId) {
    return null;
  }

  try {
    const url = new URL(`https://api.vercel.com/v1/query/web-analytics/visits/count`);
    url.searchParams.append("projectId", projectId);
    url.searchParams.append("environment", "production");
    
    // Obtener últimos 30 días
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    url.searchParams.append("since", from.toISOString());
    url.searchParams.append("until", to.toISOString());

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: {
        revalidate: 3600 // Caché de 1 hora
      }
    });

    if (!res.ok) {
      console.error("Error al obtener Vercel Analytics:", await res.text());
      return null;
    }

    const { data } = await res.json();
    
    return {
      pageviews: data?.pageviews || 0,
      visitors: data?.visitors || 0,
    };
  } catch (error) {
    console.error("Excepción obteniendo Vercel Analytics:", error);
    return null;
  }
}
