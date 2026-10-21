import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname;

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="space-y-2">
                    <p className="text-7xl font-light text-muted-foreground" aria-hidden="true">404</p>
                    <div className="h-0.5 w-16 bg-border mx-auto"></div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl font-semibold">Página no encontrada</h1>
                    <p className="text-muted-foreground leading-relaxed">
                        La página <span className="font-medium text-foreground">"{pageName}"</span> no existe en la aplicación. Revisá el enlace o volvé al inicio.
                    </p>
                </div>

                <div className="pt-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-card text-card-foreground border border-border rounded-lg hover:bg-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    >
                        <Home className="w-4 h-4" aria-hidden="true" />
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
