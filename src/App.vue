<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTheme } from 'vuetify'
import NativeVuetifyForm from '@/components/NativeVuetifyForm.vue'
import SurveyForm from '@/components/SurveyForm.vue'

const theme = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  void theme.toggle(['light', 'dark'])
}

const surveyResult = ref<Record<string, unknown> | null>(null)

function onSurveyComplete(data: Record<string, unknown>) {
  surveyResult.value = data
}
</script>

<template>
  <v-app>
    <v-app-bar elevation="1" color="surface">
      <v-app-bar-title>
        <span class="font-weight-medium">SurveyJS v3 × Vuetify</span>
        <span class="text-medium-emphasis text-body-2 ml-3 d-none d-sm-inline">
          Integration stress test
        </span>
      </v-app-bar-title>
      <template #append>
        <v-chip class="mr-3" size="small" variant="tonal" color="warning">
          Experimental adapter
        </v-chip>
        <v-btn
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        />
      </template>
    </v-app-bar>

    <v-main>
      <v-container fluid class="py-6">
        <v-alert type="info" variant="tonal" class="mb-6" density="comfortable">
          <strong>What this evaluates:</strong>
          functional Vue 3 rendering via
          <code>survey-vue3-ui@3.0.0-beta.8</code>, plus stylistic fit through an
          experimental CSS-variable bridge mapping Vuetify
          <code>--v-theme-*</code> tokens onto SurveyJS
          <code>--sjs2-*</code> tokens. Toggle light/dark — both columns should track
          the host theme.
        </v-alert>

        <v-row class="comparison-row" align="stretch">
          <v-col cols="12" md="6" class="comparison-col comparison-col--survey">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">
              SurveyJS Form Library (bridged)
            </div>
            <SurveyForm @complete="onSurveyComplete" />
          </v-col>
          <v-col cols="12" md="6" class="comparison-col comparison-col--native">
            <div class="text-subtitle-2 text-medium-emphasis mb-2">Native Vuetify baseline</div>
            <NativeVuetifyForm />
          </v-col>
        </v-row>

        <v-expand-transition>
          <v-card v-if="surveyResult" class="mt-6" variant="outlined">
            <v-card-title class="text-subtitle-1">Last SurveyJS submission</v-card-title>
            <v-card-text>
              <pre class="text-caption overflow-auto">{{ JSON.stringify(surveyResult, null, 2) }}</pre>
            </v-card-text>
          </v-card>
        </v-expand-transition>
      </v-container>
    </v-main>

    <v-footer app class="text-caption text-medium-emphasis justify-center py-3">
      No official Vuetify adapter in survey-core — bridge lives in
      <code>src/styles/vuetify-sjs-adapter.css</code>
    </v-footer>
  </v-app>
</template>

<style scoped>
@media (min-width: 960px) {
  .comparison-col--survey {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
