import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReceiptImageProps {
  uri: string;
  size?: number;
  onPress?: () => void;
  showBadge?: boolean;
}

export default function ReceiptImage({ 
  uri, 
  size = 100, 
  onPress,
  showBadge = false 
}: ReceiptImageProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="relative"
      style={{ width: size, height: size }}
    >
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        className="rounded-lg"
        resizeMode="cover"
      />
      
      {showBadge && (
        <View className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}

      {onPress && (
        <View className="absolute inset-0 bg-black/20 rounded-lg justify-center items-center">
          <View className="bg-white/30 p-2 rounded-full">
            <Ionicons name="expand" size={24} color="white" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}