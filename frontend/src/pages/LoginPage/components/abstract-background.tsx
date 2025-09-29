export function AbstractBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* Faixa principal amarela curvada */}
            <div
                className="absolute bg-gradient-to-r from-yellow-400/40 via-yellow-500/60 to-orange-400/40 blur-sm"
                style={{
                    top: '150px',
                    left: '-100px',
                    width: '800px',
                    height: '120px',
                    borderRadius: '60px',
                    transform: 'rotate(-15deg) skewX(-10deg)',
                    boxShadow: '0 0 100px rgba(227, 167, 34, 0.3)'
                }}
            />

            {/* Faixa secundária azul */}
            <div
                className="absolute bg-gradient-to-r from-blue-500/30 via-primary/40 to-blue-600/30 blur-sm"
                style={{
                    top: '400px',
                    right: '-150px',
                    width: '600px',
                    height: '80px',
                    borderRadius: '40px',
                    transform: 'rotate(20deg) skewX(15deg)',
                    boxShadow: '0 0 80px rgba(36, 48, 131, 0.2)'
                }}
            />

            {/* Elemento circular grande */}
            <div
                className="absolute rounded-full bg-gradient-to-br from-secondary/25 to-yellow-400/15 blur-xl"
                style={{
                    top: '50px',
                    right: '100px',
                    width: '300px',
                    height: '300px'
                }}
            />

            {/* Elemento circular médio */}
            <div
                className="absolute rounded-full bg-gradient-to-bl from-primary/20 to-blue-500/10 blur-lg"
                style={{
                    bottom: '100px',
                    left: '50px',
                    width: '200px',
                    height: '200px'
                }}
            />

            {/* Faixa terciária diagonal */}
            <div
                className="absolute bg-gradient-to-r from-orange-400/20 via-yellow-300/30 to-amber-400/20 blur-md"
                style={{
                    bottom: '200px',
                    left: '200px',
                    width: '500px',
                    height: '60px',
                    borderRadius: '30px',
                    transform: 'rotate(-25deg) skewX(-5deg)',
                    boxShadow: '0 0 60px rgba(251, 146, 60, 0.2)'
                }}
            />

            {/* Pontos flutuantes pequenos */}
            <div
                className="absolute rounded-full bg-yellow-400/60"
                style={{
                    top: '120px',
                    left: '300px',
                    width: '8px',
                    height: '8px'
                }}
            />
            <div
                className="absolute rounded-full bg-secondary/50"
                style={{
                    top: '350px',
                    right: '400px',
                    width: '12px',
                    height: '12px'
                }}
            />
            <div
                className="absolute rounded-full bg-primary/40"
                style={{
                    bottom: '300px',
                    left: '150px',
                    width: '6px',
                    height: '6px'
                }}
            />

            {/* Elemento elíptico para suavizar */}
            <div
                className="absolute bg-gradient-to-br from-yellow-400/15 to-orange-300/10 blur-2xl"
                style={{
                    top: '250px',
                    left: '100px',
                    width: '400px',
                    height: '150px',
                    borderRadius: '200px 50px',
                    transform: 'rotate(-10deg)'
                }}
            />
        </div>
    )
}
