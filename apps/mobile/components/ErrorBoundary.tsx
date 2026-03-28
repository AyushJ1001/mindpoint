import React from "react";
import { View, Text, Pressable } from "react-native";
import { AlertTriangle } from "lucide-react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center bg-background px-6">
          <AlertTriangle size={48} color="#dc2626" />
          <Text className="mt-4 text-xl font-bold text-foreground">
            Something went wrong
          </Text>
          {__DEV__ && this.state.error && (
            <Text className="mt-2 text-center text-sm text-muted-foreground">
              {this.state.error.message}
            </Text>
          )}
          <Pressable
            onPress={this.handleReset}
            className="mt-6 rounded-xl bg-primary px-6 py-3"
          >
            <Text className="text-base font-semibold text-white">
              Try Again
            </Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
