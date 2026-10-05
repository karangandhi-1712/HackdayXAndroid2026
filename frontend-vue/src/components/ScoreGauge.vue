<template>
  <div class="score-circle-wrap">
    <svg width="90" height="90" viewBox="0 0 90 90">
      <circle
        cx="45"
        cy="45"
        :r="radius"
        fill="none"
        stroke="rgba(255, 255, 255, 0.08)"
        stroke-width="7"
      />
      <circle
        cx="45"
        cy="45"
        :r="radius"
        fill="none"
        :stroke="threatColor"
        stroke-width="7"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
        stroke-linecap="round"
        transform="rotate(-90 45 45)"
        :style="{
          transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease',
          filter: `drop-shadow(0 0 6px ${threatColor})`,
        }"
      />
    </svg>
    <div style="position: absolute; text-align: center">
      <div class="score-num" :style="{ color: threatColor }">
        {{ Number(score).toFixed(1) }}
      </div>
      <div class="score-denom">/{{ max }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 4,
  },
})

const radius = 38
const circumference = 2 * Math.PI * radius

const strokeDashoffset = computed(() => {
  const percentage = Math.min(Math.max((props.score / props.max) * 100, 0), 100)
  return circumference - (percentage / 100) * circumference
})

const threatColor = computed(() => {
  if (props.score >= 3.5) return 'var(--threat-critical)'
  if (props.score >= 2.5) return 'var(--threat-high)'
  if (props.score >= 1.5) return 'var(--threat-medium)'
  if (props.score >= 0.5) return 'var(--accent-cyan)'
  return 'var(--threat-safe)'
})
</script>
