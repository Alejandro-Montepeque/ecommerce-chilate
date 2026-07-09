import { Component, type ReactNode } from "react";

// Captura errores de render para que un fallo no deje la app en blanco.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-md p-12 text-center text-zinc-600">
          <p className="text-lg font-semibold text-zinc-900">Algo salió mal</p>
          <p className="mt-2 text-sm text-zinc-500">
            Recarga la página para intentarlo de nuevo.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
