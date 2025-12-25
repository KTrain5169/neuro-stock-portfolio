<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
    dark?: boolean;
}>();

const isDismissed = ref(false);

function dismissBanner() {
    isDismissed.value = true;
}
</script>

<template>
    <div v-if="!isDismissed" class="banner" :class="{ dark }">
        <div class="banner-message">
            <strong>Stock Skew</strong>
            <span>Due to an unintended +$137 in Neuro's portfolio, the official display shows a slightly higher
                number.</span>
            <span>As this amount was left unused, this site does not account for that number.</span>
        </div>
        <button @click="dismissBanner" class="dismiss-btn" title="Dismiss banner">
            ✕
        </button>
    </div>
</template>

<style scoped>
.banner {
    background: linear-gradient(135deg, #db7093 0%, #ff8db3 100%);
    color: white;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    animation: slideDown 0.3s ease-out;
    border-radius: 8px;
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.banner.dark {
    background: linear-gradient(135deg, #8b0000 0%, #5d0000 100%);
}

.banner-message {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.banner-message strong {
    font-size: 1rem;
    font-weight: 600;
}

.banner-message span {
    font-size: 0.875rem;
    opacity: 0.9;
}

.dismiss-btn {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: background-color 0.2s ease;
    flex-shrink: 0;
}

.dismiss-btn:hover {
    background: rgba(255, 255, 255, 0.3);
}

.dismiss-btn:active {
    transform: scale(0.95);
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@media (max-width: 768px) {
    .banner-message {
        flex: 1;
    }

    .banner-message span {
        font-size: 0.8rem;
    }
}
</style>
