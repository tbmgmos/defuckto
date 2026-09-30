import React, { useState } from 'react';
import { FlatList, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { PhotoHero } from './PhotoHero';
import { CoinGlyph } from './CoinGlyph';
import { ProfilePhoto } from '../models';
import { computeCurrentPrice } from '../services/economyService';

interface PhotoCarouselProps {
  name: string;
  photos: ProfilePhoto[];
  unlockedIds: Set<string>;
  height: number;
  onUnlock: (photo: ProfilePhoto) => void;
  unlockingId?: string | null;
  headerOverlay?: React.ReactNode;
}

export function PhotoCarousel({ name, photos, unlockedIds, height, onUnlock, unlockingId, headerOverlay }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  // Measured, not Dimensions.get('window') — that's a one-shot read taken
  // at module-load time and can freeze at 0 on web before layout settles.
  const [slideWidth, setSlideWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => setSlideWidth(e.nativeEvent.layout.width);

  if (photos.length === 0) {
    return <PhotoHero seed={name} name={name} height={height} borderRadius={0} fillOverlay={headerOverlay} />;
  }

  return (
    <View style={{ height }} onLayout={onLayout}>
      {slideWidth > 0 ? (
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth))}
        onScroll={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / slideWidth))}
        scrollEventThrottle={32}
        renderItem={({ item, index: i }) => {
          const locked = !unlockedIds.has(item.id);
          const price = computeCurrentPrice(item.price, item.unlockCount);
          return (
            <View style={{ width: slideWidth, height }}>
              <PhotoHero
                seed={item.seed}
                name={name}
                height={height}
                borderRadius={0}
                fillOverlay={
                  <>
                    {i === 0 ? headerOverlay : null}
                    {locked ? (
                      <View style={styles.lockOverlay} pointerEvents="box-none">
                        <View style={styles.lockCard}>
                          <Ionicons name="lock-closed" size={22} color={colors.textPrimary} />
                          <Text style={styles.lockHint}>Ещё одно фото скрыто</Text>
                          <Pressable
                            onPress={() => onUnlock(item)}
                            style={styles.unlockButton}
                            accessibilityRole="button"
                            accessibilityLabel={`Открыть фото за ${price} монет`}
                          >
                            <Text style={styles.unlockButtonText}>
                              {unlockingId === item.id ? (
                                'Открываем…'
                              ) : (
                                <>
                                  Открыть за {price} <CoinGlyph size={13} color={colors.onAccent} />
                                </>
                              )}
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ) : null}
                  </>
                }
              />
            </View>
          );
        }}
      />
      ) : (
        // First frame before onLayout fires — show the cover photo (and
        // header buttons) immediately rather than a blank flash.
        <PhotoHero seed={photos[0].seed} name={name} height={height} borderRadius={0} fillOverlay={headerOverlay} />
      )}
      {slideWidth > 0 && photos.length > 1 ? (
        <View style={styles.dots} pointerEvents="none">
          {photos.map((p, i) => (
            <View key={p.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,5,4,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockCard: {
    backgroundColor: colors.overlayScrim,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  lockHint: {
    ...typography.subhead,
    color: colors.textPrimary,
  },
  unlockButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  unlockButtonText: {
    ...typography.bodyMedium,
    color: colors.onAccent,
  },
  dots: {
    position: 'absolute',
    top: spacing.sm,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
  },
});
