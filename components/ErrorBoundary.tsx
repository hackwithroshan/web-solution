import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// FIX: Extended React.Component<Props, State> to make this a valid React class component.
// This resolves errors where `this.setState` and `this.props` were not found because the class was not a component.
class ErrorBoundary extends React.Component<Props, State> {
  public state: State = { hasError: false };

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
    window.location.href = '/'; 
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