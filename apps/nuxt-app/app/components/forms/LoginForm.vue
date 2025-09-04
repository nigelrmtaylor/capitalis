<template>
  <form @submit="onSubmit" class="space-y-4">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        v-model="values.email"
        type="email"
        name="email"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        :class="{
          'border-red-500': errors.email,
          'border-gray-300': !errors.email,
        }"
        @blur="validateField('email')"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">
        {{ errors.email }}
      </p>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        id="password"
        v-model="values.password"
        type="password"
        name="password"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        :class="{
          'border-red-500': errors.password,
          'border-gray-300': !errors.password,
        }"
        @blur="validateField('password')"
      />
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">
        {{ errors.password }}
      </p>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember-me"
          v-model="values.rememberMe"
          name="remember-me"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label for="remember-me" class="ml-2 block text-sm text-gray-900">
          Remember me
        </label>
      </div>

      <div class="text-sm">
        <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
          Forgot your password?
        </a>
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="isSubmitting">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { loginSchema, type LoginFormValues } from '../../../utils/validators';

const emit = defineEmits<{
  (e: 'submit', values: LoginFormValues): void;
}>();

const {
  handleSubmit,
  errors,
  values,
  validateField,
  isSubmitting,
} = useForm(loginSchema, {
  email: '',
  password: '',
  rememberMe: false,
});

const onSubmit = handleSubmit((values) => {
  // Ensure the values match the expected type
  const formValues: LoginFormValues = {
    email: values.email as string,
    password: values.password as string,
    rememberMe: values.rememberMe as boolean | undefined
  };
  emit('submit', formValues);
});
</script>
