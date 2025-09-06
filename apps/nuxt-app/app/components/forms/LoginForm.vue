<template>
  <UForm :state="formState" class="space-y-4" @submit="handleSubmit">
    <UFormGroup label="Email" name="email" required>
      <UInput 
        v-model="formState.email"
        type="email"
        placeholder="your@email.com"
        :disabled="isSubmitting"
        autocomplete="email"
      />
    </UFormGroup>

    <UFormGroup label="Password" name="password" required>
      <UInput 
        v-model="formState.password"
        type="password"
        placeholder="••••••••"
        :disabled="isSubmitting"
        autocomplete="current-password"
      />
    </UFormGroup>

    <div class="flex items-center justify-between">
      <UCheckbox 
        v-model="formState.rememberMe" 
        name="rememberMe"
        label="Remember me" 
        :disabled="isSubmitting"
      />
      
      <div class="text-sm">
        <NuxtLink to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
          Forgot your password?
        </NuxtLink>
      </div>
    </div>

    <UButton
      type="submit"
      block
      color="primary"
      :loading="isSubmitting"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types/form'

const isSubmitting = ref(false)

const formState = reactive({
  email: '',
  password: '',
  rememberMe: false
})

type EmitEvents = {
  submit: [data: typeof formState]
}

const emit = defineEmits<EmitEvents>()

const handleSubmit = async (event: FormSubmitEvent<typeof formState>) => {
  try {
    isSubmitting.value = true
    await emit('submit', event.data)
  } finally {
    isSubmitting.value = false
  }
}

// Handle server-side validation errors if needed
const setServerErrors = (fieldErrors: Record<string, string>) => {
  // Nuxt UI will automatically show these errors in the form
  // as long as the field names match
  for (const [field, message] of Object.entries(fieldErrors)) {
    // You can add custom error handling here if needed
    console.warn(`Server validation error for ${field}:`, message)
  }
}

defineExpose({
  setServerErrors,
  resetForm: () => {
    formState.email = ''
    formState.password = ''
    formState.rememberMe = false
  }
})
</script>
