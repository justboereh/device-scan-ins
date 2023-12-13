<script setup lang="ts">
type Props = {
  modelValue?: string
  label?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'submit'])
const focused = ref(false)
</script>

<template>
  <div class="relative group flex items-center">
    <label
      for="input"
      :class="[
        'absolute left-3  pointer-events-none transform transition-all duration-200',
        modelValue || focused ? '-translate-y-3 text-black/50 text-xs' : 'text-black/75',
      ]"
    >
      {{ label }}
    </label>

    <input
      :value="modelValue"
      type="text"
      class="border border-light-700 rounded-md px-3 pb-1 pt-4 outline-none border focus:border-blue-500 transition-all duration-200 w-full"
      @input="$emit('update:modelValue', ($event?.target as HTMLInputElement)?.value)"
      @focus="focused = true"
      @blur="focused = false"
      @keypress="$event.key === 'Enter' && $emit('submit')"
      @paste="$emit('submit')"
    />
  </div>
</template>

<style>
.text-xxs {
  font-size: 0.5rem;
  line-height: 1rem;
}
</style>
