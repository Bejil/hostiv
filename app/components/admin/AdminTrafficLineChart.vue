<script setup lang="ts">
export type AdminTrafficChartPoint = {
  key: string
  label: string
  page_views: number
  unique_visitors: number
}

const props = defineProps<{
  points: AdminTrafficChartPoint[]
  locale: "fr" | "en"
  ariaLabel: string
  legendPageViews: string
  legendUniqueVisitors: string
  tooltipViewsLabel: string
  tooltipVisitorsLabel: string
}>()

const CHART_WIDTH = 960
const CHART_HEIGHT = 240
const PADDING = { top: 16, right: 16, bottom: 34, left: 44 }

const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right
const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom

const activeIndex = ref<number | null>(null)
const chartRoot = ref<HTMLElement | null>(null)

const maxValue = computed(() => {
  const values = props.points.flatMap((point) => [point.page_views, point.unique_visitors])

  return Math.max(...values, 1)
})

const yTicks = computed(() => {
  const max = maxValue.value
  const step = niceStep(max)
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []

  for (let value = 0; value <= top; value += step) {
    ticks.push(value)
  }

  return ticks.length > 1 ? ticks : [0, max]
})

function niceStep(max: number) {
  if (max <= 4) {
    return 1
  }

  const rough = max / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const normalized = rough / magnitude

  if (normalized <= 1) {
    return magnitude
  }

  if (normalized <= 2) {
    return 2 * magnitude
  }

  if (normalized <= 5) {
    return 5 * magnitude
  }

  return 10 * magnitude
}

function formatCount(value: number) {
  return new Intl.NumberFormat(props.locale === "en" ? "en-GB" : "fr-FR").format(value)
}

function xForIndex(index: number) {
  if (props.points.length <= 1) {
    return PADDING.left + plotWidth / 2
  }

  return PADDING.left + (index / (props.points.length - 1)) * plotWidth
}

function yForValue(value: number) {
  const top = yTicks.value[yTicks.value.length - 1] ?? maxValue.value

  return PADDING.top + plotHeight - (value / top) * plotHeight
}

function buildLinePath(values: number[]) {
  if (values.length === 0) {
    return ""
  }

  return values
    .map((value, index) => {
      const command = index === 0 ? "M" : "L"
      return `${command} ${xForIndex(index)} ${yForValue(value)}`
    })
    .join(" ")
}

function buildAreaPath(values: number[]) {
  if (values.length === 0) {
    return ""
  }

  const baseline = PADDING.top + plotHeight
  const line = buildLinePath(values)
  const lastX = xForIndex(values.length - 1)
  const firstX = xForIndex(0)

  return `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`
}

const pageViewsPath = computed(() => buildLinePath(props.points.map((point) => point.page_views)))
const visitorsPath = computed(() =>
  buildLinePath(props.points.map((point) => point.unique_visitors))
)
const pageViewsAreaPath = computed(() =>
  buildAreaPath(props.points.map((point) => point.page_views))
)

const xLabelIndexes = computed(() => {
  const count = props.points.length

  if (count <= 1) {
    return [0]
  }

  if (count <= 7) {
    return props.points.map((_, index) => index)
  }

  if (count <= 14) {
    return props.points.map((_, index) => index).filter((index) => index % 2 === 0 || index === count - 1)
  }

  if (count <= 31) {
    return props.points.map((_, index) => index).filter((index) => index % 5 === 0 || index === count - 1)
  }

  const step = Math.ceil(count / 6)

  return props.points
    .map((_, index) => index)
    .filter((index) => index % step === 0 || index === count - 1)
})

const activePoint = computed(() =>
  activeIndex.value === null ? null : (props.points[activeIndex.value] ?? null)
)

const tooltipLeft = computed(() => {
  if (activeIndex.value === null) {
    return "50%"
  }

  const x = xForIndex(activeIndex.value)

  return `${(x / CHART_WIDTH) * 100}%`
})

function indexFromClientX(clientX: number) {
  const root = chartRoot.value

  if (!root || props.points.length === 0) {
    return null
  }

  const rect = root.getBoundingClientRect()
  const relativeX = ((clientX - rect.left) / rect.width) * CHART_WIDTH
  const clampedX = Math.min(Math.max(relativeX, PADDING.left), PADDING.left + plotWidth)

  if (props.points.length === 1) {
    return 0
  }

  const ratio = (clampedX - PADDING.left) / plotWidth

  return Math.round(ratio * (props.points.length - 1))
}

function onPointerMove(event: PointerEvent) {
  activeIndex.value = indexFromClientX(event.clientX)
}

function onPointerLeave() {
  activeIndex.value = null
}
</script>

<template>
  <div class="admin-traffic-line-chart">
    <div class="admin-traffic-line-chart__legend" aria-hidden="true">
      <span class="admin-traffic-line-chart__legend-item">
        <span class="admin-traffic-line-chart__legend-line admin-traffic-line-chart__legend-line--views" />
        {{ legendPageViews }}
      </span>
      <span class="admin-traffic-line-chart__legend-item">
        <span class="admin-traffic-line-chart__legend-line admin-traffic-line-chart__legend-line--visitors" />
        {{ legendUniqueVisitors }}
      </span>
    </div>

    <div
      ref="chartRoot"
      class="admin-traffic-line-chart__canvas"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <svg
        class="admin-traffic-line-chart__svg"
        :viewBox="`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`"
        role="img"
        :aria-label="ariaLabel"
      >
        <g class="admin-traffic-line-chart__grid">
          <line
            v-for="tick in yTicks"
            :key="tick"
            :x1="PADDING.left"
            :x2="PADDING.left + plotWidth"
            :y1="yForValue(tick)"
            :y2="yForValue(tick)"
          />
        </g>

        <g class="admin-traffic-line-chart__y-labels">
          <text
            v-for="tick in yTicks"
            :key="`y-${tick}`"
            :x="PADDING.left - 8"
            :y="yForValue(tick)"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ formatCount(tick) }}
          </text>
        </g>

        <g class="admin-traffic-line-chart__x-labels">
          <text
            v-for="index in xLabelIndexes"
            :key="`x-${points[index]?.key ?? index}`"
            :x="xForIndex(index)"
            :y="CHART_HEIGHT - 12"
            text-anchor="middle"
          >
            {{ points[index]?.label }}
          </text>
        </g>

        <path
          v-if="pageViewsAreaPath"
          class="admin-traffic-line-chart__area"
          :d="pageViewsAreaPath"
        />

        <path
          v-if="visitorsPath"
          class="admin-traffic-line-chart__line admin-traffic-line-chart__line--visitors"
          :d="visitorsPath"
        />

        <path
          v-if="pageViewsPath"
          class="admin-traffic-line-chart__line admin-traffic-line-chart__line--views"
          :d="pageViewsPath"
        />

        <g v-if="activeIndex !== null" class="admin-traffic-line-chart__focus">
          <line
            :x1="xForIndex(activeIndex)"
            :x2="xForIndex(activeIndex)"
            :y1="PADDING.top"
            :y2="PADDING.top + plotHeight"
          />

          <circle
            :cx="xForIndex(activeIndex)"
            :cy="yForValue(points[activeIndex]?.page_views ?? 0)"
            r="4.5"
            class="admin-traffic-line-chart__dot admin-traffic-line-chart__dot--views"
          />

          <circle
            :cx="xForIndex(activeIndex)"
            :cy="yForValue(points[activeIndex]?.unique_visitors ?? 0)"
            r="4.5"
            class="admin-traffic-line-chart__dot admin-traffic-line-chart__dot--visitors"
          />
        </g>
      </svg>

      <div
        v-if="activePoint"
        class="admin-traffic-line-chart__tooltip"
        :style="{ left: tooltipLeft }"
      >
        <p class="admin-traffic-line-chart__tooltip-title">{{ activePoint.label }}</p>
        <p class="admin-traffic-line-chart__tooltip-row">
          <span>{{ tooltipViewsLabel }}</span>
          <strong>{{ formatCount(activePoint.page_views) }}</strong>
        </p>
        <p class="admin-traffic-line-chart__tooltip-row">
          <span>{{ tooltipVisitorsLabel }}</span>
          <strong>{{ formatCount(activePoint.unique_visitors) }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>
