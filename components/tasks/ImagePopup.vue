<template>
  <div v-if="show" class="image-popup-overlay" @click="$emit('close')">
    <div class="image-popup">
      <button @click="$emit('close')" class="close-popup">✕</button>
      <img :src="imageUrl" alt="Full size image" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>

<style scoped>
/* Image popup modal */
.image-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.image-popup {
  max-width: 90%;
  max-height: 90%;
  position: relative;
}

.image-popup img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
}

.close-popup {
  position: absolute;
  top: -40px;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  border: none;
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-popup:hover {
  background: white;
}
</style>
