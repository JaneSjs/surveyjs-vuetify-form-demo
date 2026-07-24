<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { Model, type Question } from 'survey-core'
import { SurveyComponent } from 'survey-vue3-ui'
import { medicalFormJson, medicalFormSample } from '@/survey/medicalForm'

import 'survey-core/survey-core.min.css'
import '@/styles/vuetify-sjs-adapter.css'

const emit = defineEmits<{
  complete: [data: Record<string, unknown>]
}>()

function createSurveyModel() {
  const survey = new Model(medicalFormJson)
  survey.isCompact = true
  return survey
}

const model = shallowRef(createSurveyModel())
const completed = ref(false)

function addPrefillAction(survey: Model) {
  survey.addNavigationItem({
    id: 'sv-prefill-demo',
    title: 'Prefill demo data',
    action: () => {
      const names = new Set(
        survey.currentPage.questions.map((q: Question) => q.getValueName()),
      )
      const pageData = Object.fromEntries(
        Object.entries(medicalFormSample).filter(([key]) => names.has(key)),
      )
      survey.mergeData(pageData)
    },
  })
}

function onComplete(sender: Model) {
  completed.value = true
  emit('complete', sender.data as Record<string, unknown>)
}

function editResponse() {
  model.value.clear(false)
  completed.value = false
}

onMounted(() => {
  addPrefillAction(model.value)
  model.value.onComplete.add(onComplete)
})

onUnmounted(() => {
  model.value.onComplete.remove(onComplete)
  model.value.navigationBar.removeActionById('sv-prefill-demo')
})
</script>

<template>
  <v-card class="overflow-hidden" variant="outlined">
    <v-alert
      v-if="completed"
      type="success"
      variant="tonal"
      class="ma-4"
      title="Submitted"
      text="Thank you. Your intake form has been submitted."
    >
      <template #append>
        <v-btn variant="text" @click="editResponse">Edit response</v-btn>
      </template>
    </v-alert>
    <SurveyComponent v-else :model="model" />
  </v-card>
</template>
