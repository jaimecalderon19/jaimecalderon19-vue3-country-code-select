# Vue 3 Country Select

A Vue 3 component for country selection with TypeScript support. This component allows you to easily add a country selector to your Vue 3 applications with full TypeScript support.


## Features

- 🚀 Built for Vue 3
- 📘 Full TypeScript support
- 🎨 Customizable styling
- 🌍 All countries included
- 🔍 Search functionality
- ⭐ Preferred countries option
- 📱 Mobile friendly
- 🔄 Auto-detection of user's country

## Preview

![Country Select Default View](https://raw.githubusercontent.com/jaimecalderon19/vue3-country-select/refs/heads/main/public/image1.png)
![Country Select Search View](https://raw.githubusercontent.com/jaimecalderon19/vue3-country-select/refs/heads/main/public/image2.png)


## Installation

```bash
npm install vue3-country-select
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VueCountryCode } from 'vue3-country-select'
import "vue3-country-select/style.css"

interface Country {
  iso2: string
  name: string
  dialCode: string
  preferred?: boolean
}

const selectedCountry = ref<Country | null>(null)

const onSelect = (data: Country) => {
  selectedCountry.value = data
}
</script>

<template>
  <VueCountryCode
    @onSelect="onSelect"
    :preferredCountries="['vn', 'us', 'gb']"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| preferredCountries | string[] | [] | Array of country codes (ISO 2) to show at the top of the list |
| disabled | boolean | false | Disable the component |
| placeholder | string | "Select Country" | Placeholder text |
| searchPlaceholder | string | "Search" | Search input placeholder |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| onSelect | Country | Emitted when a country is selected |

## Types

```typescript
interface Country {
  iso2: string
  name: string
  dialCode: string
  preferred?: boolean
}
```

## Styling

The component comes with default styling that you can import:

```javascript
import "vue3-country-select/style.css"
```

## Auto-detection

The component includes built-in country auto-detection functionality. It will attempt to detect the user's country based on their IP address using a reliable geolocation service.

## Credits

This package is inspired by [vue-country-code-select](https://www.npmjs.com/package/vue-country-code-select) but built specifically for Vue 3 with TypeScript support.