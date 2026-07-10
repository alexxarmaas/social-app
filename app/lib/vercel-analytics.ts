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
    const url = new URL(`https://vercel.com/api/v1/web-analytics/stats`);
    url.searchParams.append("projectId", projectId);
    url.searchParams.append("environment", "production");
    
    // Obtener últimos 30 días
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 30);
    url.searchParams.append("from", from.toISOString());
    url.searchParams.append("to", to.toISOString());

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

    const data = await res.json();
    
    let totalPageviews = 0;
    let totalVisitors = 0;

    // Vercel suele devolver data de forma temporal. Agregamos todo.
    if (data && Array.isArray(data.data)) {
      data.data.forEach((point: any) => {
        totalPageviews += point.pageviews || 0;
        totalVisitors += point.visitors || 0;
      });
    }

    return {
      pageviews: totalPageviews,
      visitors: totalVisitors,
    };
  } catch (error) {
    console.error("Excepción obteniendo Vercel Analytics:", error);
    return null;
  }
}
