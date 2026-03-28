import { Modal, View, Text, Pressable, type ModalProps } from "react-native";
import { X } from "lucide-react-native";

export type DialogProps = Omit<ModalProps, "children"> & {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, children, ...props }: DialogProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      {...props}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={onClose}
      >
        <Pressable
          className="border-border/70 bg-card mx-6 w-full max-w-md rounded-2xl border p-6 shadow-lg shadow-slate-900/10"
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DialogHeader({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="flex-1">{children}</View>
      {onClose && (
        <Pressable onPress={onClose} className="ml-2 p-1">
          <X size={20} color="#6b7280" />
        </Pressable>
      )}
    </View>
  );
}

export function DialogTitle({ children }: { children: string }) {
  return (
    <Text className="text-card-foreground text-lg font-semibold">
      {children}
    </Text>
  );
}

export function DialogDescription({ children }: { children: string }) {
  return <Text className="text-muted-foreground mt-1 text-sm">{children}</Text>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <View className="mt-5 flex-row justify-end gap-3">{children}</View>;
}
