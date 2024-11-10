<script setup lang="ts">
import { ref } from 'vue'
import VueCountryCode from './components/VueCountryCode.vue'

// Define la interfaz para el país seleccionado
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
  <div id="app">
    <h1>Telephone Country Select</h1>
    <h2 style="color: #999">made with &#x2764; by Mon.</h2>

    <div style="margin: 20px auto">
      <vue-country-code
          @onSelect="onSelect"
          :preferredCountries="['vn', 'us', 'gb']"
          defaultCountry=""
      />
    </div>

    <div>
      <code>{{ selectedCountry }}</code>
    </div>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>