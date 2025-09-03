import { useForm as veeUseForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import type { ZodType } from 'zod';

export const useForm = <T extends ZodType>(
  schema: T,
  initialValues?: Record<string, any>
) => {
  const form = veeUseForm({
    validationSchema: toTypedSchema(schema),
    initialValues,
  });

  const handleSubmit = form.handleSubmit;
  const errors = form.errors;
  const values = form.values;
  const meta = form.meta;
  const resetForm = form.resetForm;
  const setFieldValue = form.setFieldValue;
  const setFieldError = form.setFieldError;
  const validateField = form.validateField;
  const resetField = form.resetField;

  return {
    ...form,
    handleSubmit,
    errors,
    values,
    meta,
    resetForm,
    setFieldValue,
    setFieldError,
    validateField,
    resetField,
  };
};

export type UseFormReturn = ReturnType<typeof useForm>;
