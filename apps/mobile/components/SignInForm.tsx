import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSignIn, useSSO } from "@clerk/clerk-expo";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { GoogleLogo } from "./icons/GoogleLogo";

// Complete any pending auth sessions on app load
WebBrowser.maybeCompleteAuthSession();

/** Warm up / cool down the in-app browser for faster OAuth redirects. */
function useWarmUpBrowser() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

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
  useWarmUpBrowser();

  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    if (isGoogleLoading) return;

    setError(null);
    setIsGoogleLoading(true);

    try {
      const { createdSessionId, setActive: ssoSetActive } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: AuthSession.makeRedirectUri(),
        });

      if (createdSessionId && ssoSetActive) {
        await ssoSetActive({ session: createdSessionId });
      } else {
        setError("Google sign-in was not completed. Please try again.");
      }
    } catch (err) {
      setError(resolveClerkError(err, "Unable to sign in with Google."));
    } finally {
      setIsGoogleLoading(false);
    }
  }, [isGoogleLoading, startSSOFlow]);

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
        setPassword("");
        return;
      }

      await setActive({ session: result.createdSessionId });
      setEmailAddress("");
      setPassword("");
    } catch (submissionError) {
      setError(resolveClerkError(submissionError, "Unable to sign in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const anyLoading = isSubmitting || isGoogleLoading;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.copy}>
        Sign in to your Mind Point account to access your enrollments and more.
      </Text>

      {/* Google OAuth — follows Clerk's recommended pattern */}
      <Pressable
        disabled={anyLoading}
        onPress={handleGoogleSignIn}
        style={({ pressed }) => [
          styles.googleButton,
          anyLoading && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        {isGoogleLoading ? (
          <ActivityIndicator color="#1a1f2e" />
        ) : (
          <View style={styles.googleButtonContent}>
            <GoogleLogo size={20} />
            <Text style={styles.googleButtonLabel}>Continue with Google</Text>
          </View>
        )}
      </Pressable>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email / Password */}
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        editable={!anyLoading}
        keyboardType="email-address"
        onChangeText={setEmailAddress}
        placeholder="Email address"
        placeholderTextColor="#7b8794"
        style={styles.input}
        value={emailAddress}
      />
      <TextInput
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!anyLoading}
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
        disabled={!emailAddress || !password || anyLoading}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.button,
          (!emailAddress || !password || anyLoading) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonLabel}>Continue with Email</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: "#4338ca",
    borderRadius: 14,
    minHeight: 52,
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
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
  dividerLine: {
    backgroundColor: "#d9e2ec",
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 2,
  },
  dividerText: {
    color: "#7b8794",
    fontSize: 13,
    fontWeight: "500",
  },
  error: {
    color: "#b42318",
    fontSize: 13,
    lineHeight: 18,
  },
  googleButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9e2ec",
    borderRadius: 14,
    borderWidth: 1.5,
    minHeight: 52,
    justifyContent: "center",
  },
  googleButtonContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  googleButtonLabel: {
    color: "#1a1f2e",
    fontSize: 16,
    fontWeight: "600",
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
