import { defineStore } from 'pinia';
import { computed, nextTick, ref, watch } from 'vue';

export const useModeStore = defineStore('mode', () => {
  const mode = ref<'read' | 'edit'>('read');

  const editableElements = ref<Element[]>([]);

  function updateListOfEditableElements() {
    editableElements.value = Array.from(document.querySelectorAll('[contenteditable]'));
  }

  watch(
    mode,
    (mode) => {
      nextTick(() => {
        switch (mode) {
          case 'read':
            turnOff();
            break;

          case 'edit':
            turnOn();
            break;

          default:
            turnOff();
            break;
        }
      });
    },
    { immediate: true },
  );

  const isEditMode = computed(() => {
    return mode.value === 'edit';
  });

  const isReadMode = computed(() => {
    return mode.value === 'read';
  });

  function turnOn() {
    editableElements.value.forEach((element) => {
      element.setAttribute('notranslate', '');
      element.setAttribute('contenteditable', 'true');
    });
  }

  function turnOff() {
    editableElements.value.forEach((element) => {
      element.setAttribute('contenteditable', 'false');
    });
  }

  return {
    mode,
    isEditMode,
    isReadMode,
    updateListOfEditableElements,
  };
});
