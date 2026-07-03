'use client';

import { motion } from 'framer-motion';
import { Award, Lock, Check, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useUserStore } from '@/lib/user-store';
import {
  loyaltyLevels,
  getLoyaltyLevel,
  getProgressToNextLevel,
  getNextLevel,
  type LoyaltyReward,
} from '@/data/user-profile';
import { staggerContainer, fadeUp } from '@/lib/animations';

export function LoyaltyTab() {
  const { profile, loyaltyRewards, redeemReward } = useUserStore();
  const loyaltyLevel = getLoyaltyLevel(profile.loyaltyPoints);
  const levelConfig = loyaltyLevels[loyaltyLevel];
  const nextLevel = getNextLevel(loyaltyLevel);
  const progress = getProgressToNextLevel(profile.loyaltyPoints);

  return (
    <div className="space-y-6">
      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${levelConfig.gradient} p-6 sm:p-8 text-white`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <p className="text-sm opacity-80">Current Level</p>
              <h2 className="font-heading text-2xl font-bold">{levelConfig.label} Member</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm opacity-80">Total Points</p>
              <p className="font-heading text-3xl font-bold">{profile.loyaltyPoints}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Points to Next Level</p>
              <p className="font-heading text-3xl font-bold">
                {nextLevel ? loyaltyLevels[nextLevel].min - profile.loyaltyPoints : 0}
              </p>
            </div>
          </div>

          {nextLevel && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2 opacity-80">
                <span>{levelConfig.label}</span>
                <span>{loyaltyLevels[nextLevel].label}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full bg-white"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Level Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
          Level Benefits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(loyaltyLevels) as [string, typeof levelConfig][]).map(([key, config]) => {
            const isCurrentLevel = key === loyaltyLevel;
            const isUnlocked = loyaltyLevels[loyaltyLevel].min >= config.min;
            return (
              <div
                key={key}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrentLevel
                    ? 'border-caramel bg-caramel/5'
                    : isUnlocked
                    ? 'border-sage/30 bg-sage/5'
                    : 'border-espresso/10 dark:border-cream/10 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isUnlocked ? 'bg-sage text-white' : 'bg-espresso/5 dark:bg-cream/5'
                  }`}>
                    {isUnlocked ? <Check size={14} /> : <Lock size={14} />}
                  </div>
                  <div>
                    <p className={`font-medium text-sm ${config.color}`}>{config.label}</p>
                    <p className="text-xs text-smoke-300 dark:text-cream/40">
                      {config.min === 0 ? '0' : config.min}+ points
                    </p>
                  </div>
                </div>
                {isCurrentLevel && (
                  <span className="text-xs bg-caramel/10 text-caramel px-2 py-0.5 rounded-full">
                    Current
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-espresso-500 rounded-2xl border border-espresso/10 dark:border-cream/10 p-6"
      >
        <h3 className="font-heading font-semibold text-lg text-espresso dark:text-cream mb-4">
          Available Rewards
        </h3>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {loyaltyRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={profile.loyaltyPoints}
              onRedeem={() => redeemReward(reward.id)}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

function RewardCard({
  reward,
  userPoints,
  onRedeem,
}: {
  reward: LoyaltyReward;
  userPoints: number;
  onRedeem: () => void;
}) {
  const canAfford = userPoints >= reward.pointsRequired;

  return (
    <motion.div
      variants={fadeUp}
      className={`p-4 rounded-xl border transition-all ${
        reward.isUnlocked
          ? 'border-sage/30 bg-sage/5'
          : canAfford
          ? 'border-caramel bg-caramel/5 hover:shadow-lg hover:shadow-caramel/10'
          : 'border-espresso/10 dark:border-cream/10 opacity-60'
      }`}
    >
      <div className="text-3xl mb-3">{reward.icon}</div>
      <h4 className="font-medium text-sm text-espresso dark:text-cream mb-1">
        {reward.name}
      </h4>
      <p className="text-xs text-smoke-300 dark:text-cream/40 mb-3">
        {reward.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-caramel" />
          <span className="text-xs font-medium text-smoke-300 dark:text-cream/50">
            {reward.pointsRequired} pts
          </span>
        </div>
        {reward.isUnlocked ? (
          <span className="text-xs font-medium text-sage bg-sage/10 px-2 py-0.5 rounded-full">
            Unlocked
          </span>
        ) : canAfford ? (
          <Button variant="pill" size="sm" onClick={onRedeem}>
            Redeem
          </Button>
        ) : (
          <span className="text-xs text-smoke-300 dark:text-cream/30">
            {reward.pointsRequired - userPoints} pts needed
          </span>
        )}
      </div>
    </motion.div>
  );
}
