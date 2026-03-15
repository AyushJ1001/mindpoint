import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignIn } from "@clerk/clerk-expo";

function resolveClerkError(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "longMessage" in error &&
    typeof error.longMessage === "string"
  ) {
    return error.longMessage;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors) &&
    error.errors.length > 0
  ) {
    return resolveClerkError(error.errors[0], fallback);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function SignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (!result.createdSessionId) {
        setError("This account requires an additional sign-in step.");
        return;
      }

      await setActive({ session: result.createdSessionId });
      setPassword("");
    } catch (submissionError) {
      setError(resolveClerkError(submissionError, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.copy}>
        Use your existing Mind Point account to verify Clerk and Convex auth on
        mobile.
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onChangeText={setEmailAddress}
        placeholder="Email address"
        placeholderTextColor="#7b8794"
        style={styles.input}
        value={emailAddress}
      />
      <TextInput
        autoCapitalize="none"
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="#7b8794"
        secureTextEntry
        style={styles.input}
        textContentType="password"
        value={password}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={!emailAddress || !password || isSubmitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || isSubmitting) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonLabel}>Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#0f766e",
    borderRadius: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
  },
  buttonLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.9,
  },
  card: {
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 20,
  },
  copy: {
    color: "#516170",
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1,
    color: "#0f1720",
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  title: {
    color: "#0f1720",
    fontSize: 24,
    fontWeight: "700",
  },
});
