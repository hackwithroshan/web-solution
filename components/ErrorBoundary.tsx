import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Refactored to use a class property initializer for state instead of a constructor.
  // This modern syntax resolves TypeScript errors where properties like `state`, `setState`,
  // and `props` were not being recognized on the component instance.
  // FIX: Removed the 'public' keyword as it is not standard for state initialization.
  state: State = { hasError: false };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }
  
  private handleGoHome = () => {
    // Reset state and navigate to home
    this.setState({ hasError: false });
    window.location.hash = '/'; 
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800 p-4">
          <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong.</h1>
          <p className="text-lg text-gray-600 mb-6 text-center max-w-md">
            We've encountered an unexpected error. Our team has been notified. Please try again later.
          </p>
          <Button onClick={this.handleGoHome}>
            Go back to Homepage
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;