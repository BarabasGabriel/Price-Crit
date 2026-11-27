import './GameCover.css';

const ron = new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' });

export default function GameCover({ game }) {
    const isFree = game.price === 0;

    return (
        <a className="cover" href={game.url} target="_blank" rel="noreferrer">
            <div className="cover-image">
                <img
                    src={game.image}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                        if (event.currentTarget.src !== game.fallbackImage) event.currentTarget.src = game.fallbackImage;
                    }}
                />
                {game.discount > 0 && <span className="cover-badge">−{game.discount}%</span>}
            </div>
            <span className="cover-title">{game.title}</span>
            <span className="cover-price">
                {game.price === null ? '' : isFree ? 'Free' : ron.format(game.price)}
                {game.discount > 0 && game.regularPrice !== null && <s>{ron.format(game.regularPrice)}</s>}
            </span>
        </a>
    );
}