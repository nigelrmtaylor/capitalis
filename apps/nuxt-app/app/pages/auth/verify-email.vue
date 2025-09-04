<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
        <CheckIcon class="h-6 w-6 text-green-600" aria-hidden="true" />
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Check your email
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        We've sent a magic link to <span class="font-medium">{{ email }}</span>. Click the link to sign in to your account.
      </p>
      <div class="mt-6">
        <button
          @click="resendLink"
          :disabled="isResending"
          class="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isResending ? 'Sending...' : "Didn't receive an email? Resend" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { CheckIcon } from '@heroicons/vue/24/outline';

interface QueryParams {
  email?: string | string[]
  token?: string
  return_to?: string | string[]
}

const route = useRoute();
const query = route.query as QueryParams;
const email = ref(Array.isArray(query.email) ? query.email[0] : query.email || '');
const isResending = ref(false);

const resendLink = async () => {
  if (!email.value || isResending.value) return;
  
  isResending.value = true;
  try {
    // TODO: Implement resend logic using Hanko SDK
    console.log('Resending verification email to:', email.value);
  } catch (error) {
    console.error('Failed to resend verification email:', error);
  } finally {
    isResending.value = false;
  }
};

// Handle the email verification callback
onMounted(() => {
  // Check if we're in the callback from the magic link
  if (query.token) {
    // The Hanko SDK will handle the token automatically
    // and redirect to the dashboard or return URL
    const returnTo = (Array.isArray(query.return_to) 
      ? query.return_to[0] 
      : query.return_to) || '/';
    window.location.href = returnTo;
  }
});
</script>
