<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const PAGES = ['Patient', 'Insurance', 'History', 'Consent'] as const
const LAST_PAGE = PAGES.length - 1

type Allergy = { allergen: string; severity: string; reaction: string }

const currentPage = ref(0)
const attempted = ref([false, false, false, false])
const submitted = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  dob: '',
  sex: null as string | null,
  phone: '',
  preferredContact: null as string | null,
  carrier: '',
  memberId: '',
  groupNumber: '',
  relationship: 'self',
  hasSecondary: false,
  carrier2: '',
  memberId2: '',
  medicalHistory: {
    diabetes: null as string | null,
    hypertension: null as string | null,
    asthma: null as string | null,
    heart: null as string | null,
  },
  allergies: [] as Allergy[],
  currentMedications: '',
  consentTreatment: false,
  consentPrivacy: false,
  signedDate: '',
})

const historyRows = [
  { key: 'diabetes' as const, label: 'Diabetes' },
  { key: 'hypertension' as const, label: 'High blood pressure' },
  { key: 'asthma' as const, label: 'Asthma' },
  { key: 'heart' as const, label: 'Heart disease' },
]

const pageErrors = computed(() => {
  const show = attempted.value[currentPage.value]
  if (!show) {
    return {
      firstName: false,
      lastName: false,
      dob: false,
      carrier: false,
      memberId: false,
      carrier2: false,
      memberId2: false,
      consentTreatment: false,
      consentPrivacy: false,
    }
  }
  return {
    firstName: currentPage.value === 0 && !form.firstName.trim(),
    lastName: currentPage.value === 0 && !form.lastName.trim(),
    dob: currentPage.value === 0 && !form.dob,
    carrier: currentPage.value === 1 && !form.carrier.trim(),
    memberId: currentPage.value === 1 && !form.memberId.trim(),
    carrier2: currentPage.value === 1 && form.hasSecondary && !form.carrier2.trim(),
    memberId2: currentPage.value === 1 && form.hasSecondary && !form.memberId2.trim(),
    consentTreatment: currentPage.value === 3 && !form.consentTreatment,
    consentPrivacy: currentPage.value === 3 && !form.consentPrivacy,
  }
})

function isPageValid(page: number): boolean {
  switch (page) {
    case 0:
      return !!form.firstName.trim() && !!form.lastName.trim() && !!form.dob
    case 1:
      return (
        !!form.carrier.trim() &&
        !!form.memberId.trim() &&
        (!form.hasSecondary || (!!form.carrier2.trim() && !!form.memberId2.trim()))
      )
    case 2:
      return form.allergies.every((a) => !!a.allergen.trim())
    case 3:
      return form.consentTreatment && form.consentPrivacy
    default:
      return true
  }
}

function markAttempted(page: number) {
  if (!attempted.value[page]) {
    attempted.value = attempted.value.map((v, i) => (i === page ? true : v))
  }
}

function goBack() {
  currentPage.value = Math.max(0, currentPage.value - 1)
}

function goNext() {
  currentPage.value = Math.min(LAST_PAGE, currentPage.value + 1)
}

function complete() {
  markAttempted(currentPage.value)
  const firstInvalid = PAGES.findIndex((_, i) => !isPageValid(i))
  if (firstInvalid >= 0) {
    currentPage.value = firstInvalid
    attempted.value = attempted.value.map(() => true)
    return
  }
  submitted.value = true
}

function editResponse() {
  submitted.value = false
  currentPage.value = 0
}

function addAllergy() {
  form.allergies.push({ allergen: '', severity: '', reaction: '' })
}

function removeAllergy(index: number) {
  form.allergies.splice(index, 1)
}
</script>

<template>
  <v-card variant="outlined" class="pa-4">
    <template v-if="submitted">
      <v-alert
        type="success"
        variant="tonal"
        title="Submitted"
        text="Thank you. Your intake form has been submitted."
      >
        <template #append>
          <v-btn variant="text" @click="editResponse">Edit response</v-btn>
        </template>
      </v-alert>
    </template>

    <template v-else>
      <div class="text-h6 mb-1">Patient Intake (Native Vuetify)</div>
      <div class="text-body-2 text-medium-emphasis mb-4">
        Hand-built Vuetify controls — the stylistic baseline for comparison.
      </div>

      <v-tabs :model-value="currentPage" density="comfortable" class="mb-4" disabled>
        <v-tab v-for="(page, i) in PAGES" :key="page" :value="i">
          {{ i + 1 }}. {{ page }}
        </v-tab>
      </v-tabs>
      <v-row v-if="currentPage === 0">
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.firstName"
            label="First name"
            variant="outlined"
            density="comfortable"
            :error="pageErrors.firstName"
            :error-messages="pageErrors.firstName ? 'Required' : ''"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.lastName"
            label="Last name"
            variant="outlined"
            density="comfortable"
            :error="pageErrors.lastName"
            :error-messages="pageErrors.lastName ? 'Required' : ''"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.dob"
            label="Date of birth"
            type="date"
            variant="outlined"
            density="comfortable"
            :error="pageErrors.dob"
            :error-messages="pageErrors.dob ? 'Required' : ''"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <div class="text-caption text-medium-emphasis mb-1">Sex assigned at birth</div>
          <v-radio-group v-model="form.sex" inline hide-details density="comfortable">
            <v-radio label="Female" value="f" />
            <v-radio label="Male" value="m" />
          </v-radio-group>
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.phone"
            label="Mobile phone"
            variant="outlined"
            density="comfortable"
            placeholder="+1 (999) 999-9999"
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-select
            v-model="form.preferredContact"
            label="Preferred contact method"
            :items="['Phone', 'Email', 'Text message']"
            variant="outlined"
            density="comfortable"
          />
        </v-col>
      </v-row>
      <div v-else-if="currentPage === 1">
        <div class="text-subtitle-2 mb-3">Primary insurance</div>
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.carrier"
              label="Insurance carrier"
              variant="outlined"
              density="comfortable"
              :error="pageErrors.carrier"
              :error-messages="pageErrors.carrier ? 'Required' : ''"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.memberId"
              label="Member ID"
              variant="outlined"
              density="comfortable"
              :error="pageErrors.memberId"
              :error-messages="pageErrors.memberId ? 'Required' : ''"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.groupNumber"
              label="Group number"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12">
            <div class="text-caption text-medium-emphasis mb-1">Patient is the…</div>
            <v-radio-group v-model="form.relationship" inline hide-details density="comfortable">
              <v-radio label="Policyholder" value="self" />
              <v-radio label="Spouse" value="spouse" />
              <v-radio label="Dependent" value="dependent" />
            </v-radio-group>
          </v-col>
          <v-col cols="12" class="mt-6">
            <v-switch
              v-model="form.hasSecondary"
              label="Do you have secondary insurance?"
              color="primary"
              hide-details
              density="comfortable"
            />
          </v-col>
        </v-row>

        <template v-if="form.hasSecondary">
          <div class="text-subtitle-2 mt-4 mb-3">Secondary insurance</div>
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.carrier2"
                label="Insurance carrier"
                variant="outlined"
                density="comfortable"
                :error="pageErrors.carrier2"
                :error-messages="pageErrors.carrier2 ? 'Required' : ''"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.memberId2"
                label="Member ID"
                variant="outlined"
                density="comfortable"
                :error="pageErrors.memberId2"
                :error-messages="pageErrors.memberId2 ? 'Required' : ''"
              />
            </v-col>
          </v-row>
        </template>
      </div>
      <div v-else-if="currentPage === 2">
        <div class="text-body-2 mb-3">
          Have you ever been diagnosed with any of the following?
        </div>
        <v-row v-for="row in historyRows" :key="row.key" align="center" class="mb-1">
          <v-col cols="12" sm="4" class="py-1">{{ row.label }}</v-col>
          <v-col cols="12" sm="8" class="py-1">
            <v-radio-group
              v-model="form.medicalHistory[row.key]"
              inline
              hide-details
              density="compact"
            >
              <v-radio label="Yes" value="yes" />
              <v-radio label="No" value="no" />
              <v-radio label="Unsure" value="unsure" />
            </v-radio-group>
          </v-col>
        </v-row>

        <div class="text-subtitle-2 mt-4 mb-2">Allergies</div>
        <div v-if="!form.allergies.length" class="text-body-2 text-medium-emphasis mb-2">
          No allergies added.
        </div>
        <v-row v-for="(allergy, index) in form.allergies" :key="index" class="mb-1">
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="allergy.allergen"
              label="Allergen *"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="3">
            <v-select
              v-model="allergy.severity"
              label="Severity"
              :items="['Mild', 'Moderate', 'Severe']"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="allergy.reaction"
              label="Reaction"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
          <v-col cols="12" sm="1" class="d-flex align-center">
            <v-btn icon="mdi-close" variant="text" size="small" @click="removeAllergy(index)" />
          </v-col>
        </v-row>
        <v-btn variant="text" color="primary" class="mb-4" @click="addAllergy">Add allergy</v-btn>

        <v-textarea
          v-model="form.currentMedications"
          label="Current medications"
          variant="outlined"
          density="comfortable"
          rows="3"
        />
      </div>
      <div v-else>
        <v-checkbox
          v-model="form.consentTreatment"
          label="I consent to treatment"
          color="primary"
          :error="pageErrors.consentTreatment"
          :error-messages="pageErrors.consentTreatment ? 'Required' : ''"
          hide-details="auto"
        />
        <v-checkbox
          v-model="form.consentPrivacy"
          label="I acknowledge the privacy practices (HIPAA)"
          color="primary"
          :error="pageErrors.consentPrivacy"
          :error-messages="pageErrors.consentPrivacy ? 'Required' : ''"
          hide-details="auto"
          class="mb-4"
        />
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.signedDate"
              label="Date"
              type="date"
              variant="outlined"
              density="comfortable"
            />
          </v-col>
        </v-row>
      </div>

      <div class="d-flex justify-space-between ga-2 mt-4">
        <v-btn v-if="currentPage > 0" variant="text" @click="goBack">Previous</v-btn>
        <div v-else />
        <v-btn
          v-if="currentPage < LAST_PAGE"
          variant="outlined"
          color="primary"
          @click="goNext"
        >
          Next
        </v-btn>
        <v-btn v-else color="primary" @click="complete">Complete</v-btn>
      </div>
    </template>
  </v-card>
</template>
