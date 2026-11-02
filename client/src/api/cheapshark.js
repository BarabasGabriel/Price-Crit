// Talks to the CheapShark price API: https://apidocs.cheapshark.com

const STEAM_IMAGE = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

export async function getDeals(params) {
    const query = new URLSearchParams({ pageSize: '12', ...params });
    const response = await fetch(`/cheapshark/deals?${query}`);
    if (!response.ok) throw new Error(`CheapShark answered ${response.status}`);
    const deals = await response.json();

    return deals.map((deal) => ({
        id: deal.dealID,
        title: deal.title,
        price: Number(deal.salePrice),
        regularPrice: Number(deal.normalPrice),
        discount: Math.round(Number(deal.savings)),
        // Steam's wide cover looks much better than CheapShark's small thumbnail.
        image: deal.steamAppID ? `${STEAM_IMAGE}/${deal.steamAppID}/header.jpg` : deal.thumb,
        fallbackImage: deal.thumb,
        url: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(deal.dealID)}`,
    }));
}